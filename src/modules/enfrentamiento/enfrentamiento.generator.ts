import { ObjectIdLike } from "@/types/types";
import { Types } from "mongoose";
import { LigaDoc } from "../liga/liga.model";
import { EnfrentamientoModel } from "./enfrentamiento.model";
import { EstadoEquipoEnLiga } from "recreativos-air-core/liga";
import { EstadoEnfrentamiento } from "recreativos-air-core/enfrentamiento";

export const EnfrentamientoGenerator = {
  /**
   * Genera enfrentamientos para un nuevo equipo (sin duplicar).
   */
  generarParaNuevoEquipo: async (liga: LigaDoc, equipoNuevoId: ObjectIdLike) => {
    if (!liga?.configuracion)
      throw new Error("Liga sin configuración válida para generar enfrentamientos");

    const idNuevo = new Types.ObjectId(equipoNuevoId);

    const equiposConfirmados = liga.equipos.filter(
      (e) =>
        e.estado === EstadoEquipoEnLiga.Aprobado &&
        e.equipo &&
        e.equipo.toString() !== equipoNuevoId
    );

    if (equiposConfirmados.length === 0) return;

    // Forzamos el tipo para que equipoA/equipoB sean ObjectId
    const enfrentamientosExistentes = (await EnfrentamientoModel.find({
      liga: liga._id,
    }).select("equipoA equipoB")) as Array<{
      equipoA: Types.ObjectId;
      equipoB: Types.ObjectId;
    }>;

    const nuevosEnfrentamientos: Array<Record<string, unknown>> = [];

    for (const equipoExistente of equiposConfirmados) {
      const idExistente = getObjectId(equipoExistente.equipo);

      if (idExistente.equals(idNuevo)) continue;

      const yaExisteIda = enfrentamientosExistentes.some(
        (e) => e.equipoA.equals(idNuevo) && e.equipoB.equals(idExistente)
      );

      const yaExisteVuelta = enfrentamientosExistentes.some(
        (e) => e.equipoA.equals(idExistente) && e.equipoB.equals(idNuevo)
      );

      const partidosPorEnfrentamiento = Number(
        liga.configuracion.partidosPorEnfrentamiento ?? 1
      );

      if (!yaExisteIda) {
        nuevosEnfrentamientos.push(
          crearEnfrentamiento(liga._id, idNuevo, idExistente, partidosPorEnfrentamiento)
        );
      }

      if (liga.configuracion.idaYVuelta && !yaExisteVuelta) {
        nuevosEnfrentamientos.push(
          crearEnfrentamiento(liga._id, idExistente, idNuevo, partidosPorEnfrentamiento)
        );
      }
    }

    if (nuevosEnfrentamientos.length > 0) {
      await EnfrentamientoModel.insertMany(nuevosEnfrentamientos);
    }
  },

  /**
   * Genera los enfrentamientos iniciales al arrancar la liga (solo los faltantes).
   */
  generarAlArrancarLiga: async (liga: LigaDoc) => {
    if (!liga?.configuracion)
      throw new Error("Liga sin configuración válida para generar enfrentamientos");

    const equiposConfirmados = liga.equipos.filter(
      (e) => e.estado === EstadoEquipoEnLiga.Aprobado && e.equipo
    );

    if (equiposConfirmados.length < 2) return;

    const enfrentamientosExistentes = (await EnfrentamientoModel.find({
      liga: liga._id,
    }).select("equipoA equipoB")) as Array<{
      equipoA: Types.ObjectId;
      equipoB: Types.ObjectId;
    }>;

    const nuevosEnfrentamientos: Array<Record<string, unknown>> = [];
    const partidosPorEnfrentamiento = Number(
      liga.configuracion.partidosPorEnfrentamiento ?? 1
    );

    for (let i = 0; i < equiposConfirmados.length; i++) {
      for (let j = i + 1; j < equiposConfirmados.length; j++) {
        const equipoA = getObjectId(equiposConfirmados[i].equipo);
        const equipoB = getObjectId(equiposConfirmados[j].equipo);

        const yaExisteIda = enfrentamientosExistentes.some(
          (e) => e.equipoA.equals(equipoA) && e.equipoB.equals(equipoB)
        );

        const yaExisteVuelta = enfrentamientosExistentes.some(
          (e) => e.equipoA.equals(equipoB) && e.equipoB.equals(equipoA)
        );

        if (!yaExisteIda) {
          nuevosEnfrentamientos.push(
            crearEnfrentamiento(liga._id, equipoA, equipoB, partidosPorEnfrentamiento)
          );
        }

        if (liga.configuracion.idaYVuelta && !yaExisteVuelta) {
          nuevosEnfrentamientos.push(
            crearEnfrentamiento(liga._id, equipoB, equipoA, partidosPorEnfrentamiento)
          );
        }
      }
    }

    if (nuevosEnfrentamientos.length > 0) {
      await EnfrentamientoModel.insertMany(nuevosEnfrentamientos);
    }
  },
};

/**
 * Crea un enfrentamiento inicializado.
 */
function crearEnfrentamiento(
  ligaId: Types.ObjectId,
  equipoA: Types.ObjectId,
  equipoB: Types.ObjectId,
  partidosPorEnfrentamiento: number
) {
  return {
    liga: ligaId,
    equipoA,
    equipoB,
    partidos: Array.from({ length: partidosPorEnfrentamiento }, () => ({
      golesA: 0,
      golesB: 0,
    })),
    estado: EstadoEnfrentamiento.SinJugar,
    ubicacion: "",
  };
}

/**
 * Convierte cualquier valor a ObjectId de forma segura.
 */
function getObjectId(value: any): Types.ObjectId {
  if (value instanceof Types.ObjectId) return value;
  if (value && value._id instanceof Types.ObjectId) return value._id;
  if (typeof value === "string") return new Types.ObjectId(value);
  throw new Error("Invalid ObjectId value");
}
