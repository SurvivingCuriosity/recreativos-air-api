import { Types } from "mongoose";
import { EstadoEquipoEnLiga, EstadoLiga } from "recreativos-air-core/liga";
import { EstadoEnfrentamiento } from "recreativos-air-core/enfrentamiento";
import { LigaDoc } from "../liga/liga.model";
import {
  OcupacionJornadas,
  calcularFechasJornadas,
  generarRoundRobin,
  ocupar,
  primeraJornadaLibre,
  siguienteJornada,
} from "../liga/liga.jornadas";
import { EnfrentamientoModel } from "./enfrentamiento.model";

type LigaLike = Pick<
  LigaDoc,
  | "_id"
  | "equipos"
  | "configuracion"
  | "estadoLiga"
  | "jornadas"
  | "duracionJornadaDias"
  | "save"
  | "isModified"
>;

type Existente = {
  _id: Types.ObjectId;
  equipoA: Types.ObjectId;
  equipoB: Types.ObjectId;
  jornada: number | null;
  estado: EstadoEnfrentamiento;
};

type Pareja = [string, string];

/**
 * Generación y reconciliación de enfrentamientos.
 *
 * El conjunto de enfrentamientos de una liga se deriva siempre de sus equipos
 * aprobados y de su configuración: `sincronizar` hace converger la base de
 * datos a ese conjunto (crea los que faltan, elimina sobrantes y duplicados,
 * conserva los jugados y asigna jornada). Es idempotente y se llama tras
 * cualquier cambio de equipos o de estado.
 */
export const EnfrentamientoGenerator = {
  /**
   * Arranque (o recálculo completo): calendario round-robin con jornadas
   * numeradas y fechas. Los enfrentamientos ya existentes se conservan y se
   * recolocan en su jornada; los que faltan se crean; los sobrantes se eliminan.
   */
  generarAlArrancarLiga: async (
    liga: LigaLike,
    opciones: { fechaPrimeraJornada: string; duracionJornadaDias: number }
  ) => {
    const cfg = configuracion(liga);
    const ids = equiposAprobados(liga);
    const rondas = ids.length >= 2 ? generarRoundRobin(ids, cfg.idaYVuelta) : [];

    const existentes = await cargarExistentes(liga, cfg.idaYVuelta);
    const esperadas = new Set<string>();
    const nuevos: Array<Record<string, unknown>> = [];
    const updates: Array<{ _id: Types.ObjectId; jornada: number }> = [];

    rondas.forEach((ronda, idx) => {
      const numero = idx + 1;
      for (const [a, b] of ronda) {
        const clave = clavePareja(a, b, cfg.idaYVuelta);
        esperadas.add(clave);
        const existente = existentes.get(clave);
        if (!existente) {
          nuevos.push(crearEnfrentamiento(liga._id, a, b, cfg.partidosPorEnfrentamiento, numero));
        } else if (existente.jornada !== numero) {
          updates.push({ _id: existente._id, jornada: numero });
        }
      }
    });

    const eliminar = [...existentes.entries()]
      .filter(([clave]) => !esperadas.has(clave))
      .map(([, e]) => e._id);

    await aplicar({ nuevos, updates, eliminar });

    liga.jornadas = calcularFechasJornadas(
      rondas.length,
      opciones.fechaPrimeraJornada,
      opciones.duracionJornadaDias
    );
    liga.duracionJornadaDias = opciones.duracionJornadaDias;
    await liga.save();
  },

  /**
   * Reconcilia los enfrentamientos con los equipos aprobados actuales.
   * - Liga sin empezar: no debe haber enfrentamientos pendientes.
   * - Liga en curso o finalizada: existen exactamente las parejas esperadas.
   *   Los nuevos se colocan en la primera jornada libre para ambos equipos y,
   *   si no hay hueco, en una jornada nueva al final.
   */
  sincronizar: async (liga: LigaLike) => {
    if (liga.estadoLiga === EstadoLiga.SinEmpezar) {
      await EnfrentamientoModel.deleteMany({
        liga: liga._id,
        estado: EstadoEnfrentamiento.SinJugar,
      });
      return;
    }

    const cfg = configuracion(liga);
    const ids = equiposAprobados(liga);
    const existentes = await cargarExistentes(liga, cfg.idaYVuelta);
    const esperadas = parejasEsperadas(ids, cfg.idaYVuelta);
    const esperadasClaves = new Set(
      esperadas.map(([a, b]) => clavePareja(a, b, cfg.idaYVuelta))
    );

    const eliminar = [...existentes.entries()]
      .filter(([clave]) => !esperadasClaves.has(clave))
      .map(([, e]) => e._id);

    // Ligas anteriores al calendario: se mantienen sin jornada hasta recalcular.
    const conJornadas = liga.jornadas.length > 0;
    const ocupacion: OcupacionJornadas = new Map();
    for (const [clave, e] of existentes) {
      if (!esperadasClaves.has(clave) || e.jornada === null) continue;
      ocupar(ocupacion, e.jornada, e.equipoA.toString(), e.equipoB.toString());
    }

    const nuevos: Array<Record<string, unknown>> = [];
    const updates: Array<{ _id: Types.ObjectId; jornada: number }> = [];
    let numJornadas = liga.jornadas.length;
    const inicioVuelta = cfg.idaYVuelta ? Math.floor(numJornadas / 2) + 1 : 1;

    const asignar = (a: string, b: string, esVuelta: boolean) => {
      const numero = primeraJornadaLibre(ocupacion, numJornadas, a, b, esVuelta ? inicioVuelta : 1);
      ocupar(ocupacion, numero, a, b);
      numJornadas = Math.max(numJornadas, numero);
      return numero;
    };

    esperadas.forEach(([a, b], i) => {
      const esVuelta = cfg.idaYVuelta && i >= esperadas.length / 2;
      const existente = existentes.get(clavePareja(a, b, cfg.idaYVuelta));
      if (!existente) {
        const jornada = conJornadas ? asignar(a, b, esVuelta) : null;
        nuevos.push(crearEnfrentamiento(liga._id, a, b, cfg.partidosPorEnfrentamiento, jornada));
      } else if (conJornadas && existente.jornada === null) {
        updates.push({ _id: existente._id, jornada: asignar(a, b, esVuelta) });
      }
    });

    await aplicar({ nuevos, updates, eliminar });

    // Amplía el calendario si hizo falta y poda las jornadas vacías del final
    while (liga.jornadas.length < numJornadas)
      liga.jornadas.push(siguienteJornada(liga.jornadas, liga.duracionJornadaDias));
    const ultimaOcupada = Math.max(0, ...[...ocupacion.keys()]);
    if (conJornadas && liga.jornadas.length > ultimaOcupada)
      liga.jornadas = liga.jornadas.slice(0, ultimaOcupada);
    if (liga.isModified("jornadas")) await liga.save();
  },
};

function configuracion(liga: LigaLike) {
  if (!liga?.configuracion)
    throw new Error("Liga sin configuración válida para generar enfrentamientos");
  return {
    idaYVuelta: !!liga.configuracion.idaYVuelta,
    partidosPorEnfrentamiento: Number(liga.configuracion.partidosPorEnfrentamiento ?? 1),
  };
}

function equiposAprobados(liga: LigaLike): string[] {
  return liga.equipos
    .filter((e) => e.estado === EstadoEquipoEnLiga.Aprobado && e.equipo)
    .map((e) => getObjectId(e.equipo).toString())
    .sort();
}

/** Sin ida y vuelta la pareja es no ordenada; con ida y vuelta importa el lado. */
function clavePareja(a: string, b: string, idaYVuelta: boolean) {
  return idaYVuelta ? `${a}|${b}` : [a, b].sort().join("|");
}

function parejasEsperadas(ids: string[], idaYVuelta: boolean): Pareja[] {
  const ida: Pareja[] = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) ida.push([ids[i], ids[j]]);
  if (!idaYVuelta) return ida;
  return [...ida, ...ida.map(([a, b]) => [b, a] as Pareja)];
}

/**
 * Carga los enfrentamientos de la liga indexados por pareja. Si hay duplicados
 * conserva el que tenga resultado (o el más antiguo) y elimina el resto.
 */
async function cargarExistentes(liga: LigaLike, idaYVuelta: boolean) {
  const docs = (await EnfrentamientoModel.find({ liga: liga._id })
    .select("equipoA equipoB jornada estado createdAt")
    .sort({ createdAt: 1 })
    .lean()) as unknown as Existente[];

  const porClave = new Map<string, Existente>();
  const duplicados: Types.ObjectId[] = [];

  for (const doc of docs) {
    const clave = clavePareja(doc.equipoA.toString(), doc.equipoB.toString(), idaYVuelta);
    const actual = porClave.get(clave);
    if (!actual) {
      porClave.set(clave, { ...doc, jornada: doc.jornada ?? null });
    } else if (
      actual.estado === EstadoEnfrentamiento.SinJugar &&
      doc.estado !== EstadoEnfrentamiento.SinJugar
    ) {
      duplicados.push(actual._id);
      porClave.set(clave, { ...doc, jornada: doc.jornada ?? null });
    } else {
      duplicados.push(doc._id);
    }
  }

  if (duplicados.length > 0)
    await EnfrentamientoModel.deleteMany({ _id: { $in: duplicados } });

  return porClave;
}

async function aplicar(cambios: {
  nuevos: Array<Record<string, unknown>>;
  updates: Array<{ _id: Types.ObjectId; jornada: number }>;
  eliminar: Types.ObjectId[];
}) {
  if (cambios.eliminar.length > 0)
    await EnfrentamientoModel.deleteMany({ _id: { $in: cambios.eliminar } });
  if (cambios.updates.length > 0)
    await EnfrentamientoModel.bulkWrite(
      cambios.updates.map((u) => ({
        updateOne: { filter: { _id: u._id }, update: { $set: { jornada: u.jornada } } },
      }))
    );
  if (cambios.nuevos.length > 0) await EnfrentamientoModel.insertMany(cambios.nuevos);
}

function crearEnfrentamiento(
  ligaId: Types.ObjectId,
  equipoA: string,
  equipoB: string,
  partidosPorEnfrentamiento: number,
  jornada: number | null
) {
  return {
    liga: ligaId,
    equipoA: new Types.ObjectId(equipoA),
    equipoB: new Types.ObjectId(equipoB),
    partidos: Array.from({ length: partidosPorEnfrentamiento }, () => ({
      golesA: 0,
      golesB: 0,
    })),
    estado: EstadoEnfrentamiento.SinJugar,
    ubicacion: "",
    jornada,
  };
}

function getObjectId(value: any): Types.ObjectId {
  if (value instanceof Types.ObjectId) return value;
  if (value && value._id instanceof Types.ObjectId) return value._id;
  if (typeof value === "string") return new Types.ObjectId(value);
  throw new Error("Invalid ObjectId value");
}
