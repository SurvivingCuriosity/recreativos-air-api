import { ObjectIdLike } from "@/types/types";
import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { EnfrentamientoGenerator } from "../enfrentamiento/enfrentamiento.generator";
import { EnfrentamientoRepository } from "../enfrentamiento/enfrentamiento.repository";
import { EquipoRepository } from "../equipo/equipo.repository";
import { LigaClasificacionHelper } from "./liga.clasificacion";
import { LigaRepository } from "./liga.repository";
import { CrearLigaBody, EstadoEquipoEnLiga, EstadoLiga } from "recreativos-air-core/liga";

export const LigaService = {
  crearLiga: async (data: CrearLigaBody, adminId: ObjectIdLike) => {
    if (!data.nombre || !data.tipoFutbolin || !data.configuracion)
      throw new ApiError(400, "Faltan datos obligatorios");

    const liga = await LigaRepository.create({
      nombre: data.nombre,
      descripcion: data.descripcion ?? "",
      tipoFutbolin: data.tipoFutbolin,
      estadoLiga: data.estadoLiga,
      ubicaciones: data.ubicaciones ?? [],
      premio: data.premio ?? "",
      normas: data.normas ?? "",
      configuracion: {
        partidosPorEnfrentamiento: data.configuracion.partidosPorEnfrentamiento,
        golesParaGanar: data.configuracion.golesParaGanar,
        idaYVuelta: data.configuracion.idaYVuelta,
      },
      equipos: [],
      createdBy: new Types.ObjectId(adminId),
    });

    return liga;
  },

  obtenerLigas: async () => {
    return LigaRepository.findAll();
  },

  obtenerLigaPorId: async (id: ObjectIdLike) => {
    const liga = await LigaRepository.findById(id);
    if (!liga) throw new ApiError(404, "Liga no encontrada");
    return liga;
  },

  inscribirEquipo: async (ligaId: ObjectIdLike, equipoId: ObjectIdLike) => {
    const liga = await LigaRepository.findById(ligaId);
    if (!liga) throw new ApiError(404, "Liga no encontrada");

    if (
      liga.equipos.some((e) =>
        e.equipo instanceof Types.ObjectId
          ? e.equipo.equals(equipoId)
          : e.equipo._id.equals(equipoId)
      )
    )
      throw new ApiError(400, "El equipo ya está inscrito");

    const equipo = await EquipoRepository.findById(equipoId);
    if (!equipo) throw new ApiError(404, "Equipo no encontrado");

    liga.equipos.push({
      equipo: new Types.ObjectId(equipoId) as any,
      pagado: false,
      estado: EstadoEquipoEnLiga.Pendiente,
    });

    await liga.save();
    return liga;
  },

  aprobarInscripcion: async (
    ligaId: ObjectIdLike,
    equipoId: ObjectIdLike,
    aprobar: boolean
  ) => {
    const liga = await LigaRepository.findById(ligaId);
    if (!liga) throw new ApiError(404, "Liga no encontrada");

    const equipoLiga = liga.equipos.find((e) => {
      const id =
        e.equipo instanceof Types.ObjectId
          ? e.equipo.toString()
          : e.equipo._id?.toString();
      return id === equipoId;
    });

    if (!equipoLiga) throw new ApiError(400, "Equipo no inscrito");

    equipoLiga.estado = aprobar
      ? EstadoEquipoEnLiga.Aprobado
      : EstadoEquipoEnLiga.Rechazado;
    await liga.save();

    await EnfrentamientoGenerator.generarParaNuevoEquipo(liga, equipoId);

    return liga;
  },

  cambiarEstado: async (ligaId: ObjectIdLike, nuevoEstado: EstadoLiga) => {
    const liga = await LigaRepository.findById(ligaId);
    if (!liga) throw new ApiError(404, "Liga no encontrada");

    liga.estadoLiga = nuevoEstado;
    await liga.save();
    return liga;
  },

  marcarPagado: async (ligaId: ObjectIdLike, equipoId: ObjectIdLike) => {
    const liga = await LigaRepository.findById(ligaId);
    if (!liga) throw new ApiError(404, "Liga no encontrada");

    const equipoLiga = liga.equipos.find((e) => {
      const id =
        e.equipo instanceof Types.ObjectId
          ? e.equipo.toString()
          : e.equipo._id?.toString();
      return id === equipoId;
    });

    if (!equipoLiga) throw new ApiError(400, "Equipo no inscrito");

    equipoLiga.pagado = true;
    await liga.save();

    return liga;
  },

  obtenerEquipos: async (ligaId: ObjectIdLike) => {
    const liga = await LigaRepository.findById(ligaId);
    if (!liga) throw new ApiError(404, "Liga no encontrada");

    const equipos = liga.equipos.map((e) => {
      const equipo = e.equipo;
      if (equipo instanceof Types.ObjectId) {
        return { id: equipo.toString(), nombre: "", jugadores: [] };
      }

      return {
        id: equipo._id.toString(),
        nombre: equipo.nombre,
        jugadores: equipo.jugadores.map((j) => ({
          id: j._id?.toString() ?? "",
          nombre: j.nombre,
          suplente: j.suplente,
        })),
      };
    });

    return equipos;
  },

  obtenerClasificacion: async (ligaId: ObjectIdLike) => {
    const liga = await LigaRepository.findById(ligaId);
    if (!liga) throw new Error("Liga no encontrada");

    const enfrentamientos = await EnfrentamientoRepository.findJugadosPorLiga(
      ligaId
    );

    return LigaClasificacionHelper.calcular(liga, enfrentamientos);
  },
};
