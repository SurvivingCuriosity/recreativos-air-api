import { ObjectIdLike } from "@/types/types";
import { Types } from "mongoose";
import { LigaDoc } from "../liga/liga.model";
import { EnfrentamientoModel } from "./enfrentamiento.model";
import { EstadoEquipoEnLiga } from "recreativos-air-core/liga";
import { EstadoEnfrentamiento } from "recreativos-air-core/enfrentamiento";

export const EnfrentamientoGenerator = {
  generarParaNuevoEquipo: async (
    liga: LigaDoc,
    equipoNuevoId: ObjectIdLike
  ) => {
    if (!liga?.configuracion)
      throw new Error(
        "Liga sin configuración válida para generar enfrentamientos"
      );

    const idNuevo = new Types.ObjectId(equipoNuevoId);

    // Filtramos solo los equipos ya aprobados y distintos al nuevo
    const equiposConfirmados = liga.equipos.filter(
      (e) =>
        e.estado === EstadoEquipoEnLiga.Aprobado &&
        e.equipo &&
        e.equipo.toString() !== equipoNuevoId
    );

    const nuevosEnfrentamientos: Array<Record<string, unknown>> = [];

    for (const equipoExistente of equiposConfirmados) {
      const idExistente = new Types.ObjectId(
        equipoExistente.equipo instanceof Types.ObjectId
          ? equipoExistente.equipo
          : equipoExistente.equipo._id
      );

      // ✅ Evitar autoenfrentamiento
      if (idExistente.equals(idNuevo)) continue;

      // 🏟 Ida
      nuevosEnfrentamientos.push({
        liga: liga._id,
        equipoA: idNuevo,
        equipoB: idExistente,
        partidos: Array.from(
          { length: liga.configuracion.partidosPorEnfrentamiento } as { length: number },
          () => ({ golesA: 0, golesB: 0 })
        ),
        estado: EstadoEnfrentamiento.SinJugar,
        ubicacion: "", // se podrá definir más adelante
      });

      // 🔁 Vuelta (si aplica)
      if (liga.configuracion.idaYVuelta) {
        nuevosEnfrentamientos.push({
          liga: liga._id,
          equipoA: idExistente,
          equipoB: idNuevo,
          partidos: Array.from(
            { length: liga.configuracion.partidosPorEnfrentamiento } as { length: number },
            () => ({ golesA: 0, golesB: 0 })
          ),
          estado: EstadoEnfrentamiento.SinJugar,
          ubicacion: "",
        });
      }
    }

    if (nuevosEnfrentamientos.length > 0) {
      await EnfrentamientoModel.insertMany(nuevosEnfrentamientos);
    }
  },
generarAlArrancarLiga: async (liga: LigaDoc) => {
    if (!liga?.configuracion)
      throw new Error("Liga sin configuración válida para generar enfrentamientos");

    // Filtramos solo equipos aprobados
    const equiposConfirmados = liga.equipos.filter(
      (e) => e.estado === EstadoEquipoEnLiga.Aprobado && e.equipo
    );

    if (equiposConfirmados.length < 2) return; // no se pueden generar enfrentamientos

    const nuevosEnfrentamientos: Array<Record<string, unknown>> = [];

    for (let i = 0; i < equiposConfirmados.length; i++) {
      for (let j = i + 1; j < equiposConfirmados.length; j++) {
        const equipoA = getObjectId(equiposConfirmados[i].equipo);
        const equipoB = getObjectId(equiposConfirmados[j].equipo);

        nuevosEnfrentamientos.push({
          liga: liga._id,
          equipoA,
          equipoB,
          partidos: Array.from(
            { length: liga.configuracion.partidosPorEnfrentamiento } as { length: number },
            () => ({ golesA: 0, golesB: 0 })
          ),
          estado: EstadoEnfrentamiento.SinJugar,
          ubicacion: "",
        });

        // ida y vuelta
        if (liga.configuracion.idaYVuelta) {
          nuevosEnfrentamientos.push({
            liga: liga._id,
            equipoA: equipoB,
            equipoB: equipoA,
            partidos: Array.from(
              { length: liga.configuracion.partidosPorEnfrentamiento } as { length: number },
              () => ({ golesA: 0, golesB: 0 })
            ),
            estado: EstadoEnfrentamiento.SinJugar,
            ubicacion: "",
          });
        }
      }
    }

    if (nuevosEnfrentamientos.length > 0) {
      await EnfrentamientoModel.insertMany(nuevosEnfrentamientos);
    }
  },
};

function getObjectId(value: any): Types.ObjectId {
  if (value instanceof Types.ObjectId) return value;
  if (value && value._id instanceof Types.ObjectId) return value._id;
  if (typeof value === "string") return new Types.ObjectId(value);
  throw new Error("Invalid ObjectId value");
}