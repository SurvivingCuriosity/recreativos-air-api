import { ObjectIdLike } from "@/types/types";
import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { EnfrentamientoGenerator } from "../enfrentamiento/enfrentamiento.generator";
import { EnfrentamientoRepository } from "../enfrentamiento/enfrentamiento.repository";
import { EquipoRepository } from "../equipo/equipo.repository";
import { LigaClasificacionHelper } from "./liga.clasificacion";
import { LigaRepository } from "./liga.repository";
import {
  ActualizarLigaBody,
  CrearLigaBody,
  EstadoEquipoEnLiga,
  EstadoLiga,
  GetLigasQuery,
  SIN_TEMPORADA,
} from "recreativos-air-core/liga";
import { TemporadaRepository } from "../temporada/temporada.repository";

export const LigaService = {
  crearLiga: async (data: CrearLigaBody, adminId: ObjectIdLike) => {
    if (!data.nombre || !data.tipoFutbolin || !data.configuracion)
      throw new ApiError(400, "Faltan datos obligatorios");

    if (data.temporada) {
      if (!Types.ObjectId.isValid(data.temporada))
        throw new ApiError(400, "ID de temporada inválido");
      const temporada = await TemporadaRepository.findById(data.temporada);
      if (!temporada) throw new ApiError(404, "Temporada no encontrada");
    }

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
      temporada: data.temporada ? new Types.ObjectId(data.temporada) : null,
    });

    return liga;
  },

  obtenerLigas: async (query: GetLigasQuery) => {
    if (!query.temporada) return LigaRepository.findAll();
    if (query.temporada === SIN_TEMPORADA)
      return LigaRepository.findAll({ temporada: null });
    if (!Types.ObjectId.isValid(query.temporada))
      throw new ApiError(400, "ID de temporada inválido");

    return LigaRepository.findAll({
      temporada: new Types.ObjectId(query.temporada),
    });
  },

  actualizarLiga: async (id: ObjectIdLike, data: ActualizarLigaBody) => {
    const liga = await LigaRepository.findById(id);
    if (!liga) throw new ApiError(404, "Liga no encontrada");

    if (data.tipoFutbolin !== undefined && liga.estadoLiga !== EstadoLiga.SinEmpezar)
      throw new ApiError(
        400,
        "El tipo de futbolín solo se puede cambiar antes de arrancar la liga"
      );

    if (data.temporada) {
      if (!Types.ObjectId.isValid(data.temporada))
        throw new ApiError(400, "ID de temporada inválido");
      const temporada = await TemporadaRepository.findById(data.temporada);
      if (!temporada) throw new ApiError(404, "Temporada no encontrada");
    }

    if (data.nombre !== undefined) liga.nombre = data.nombre;
    if (data.descripcion !== undefined) liga.descripcion = data.descripcion;
    if (data.tipoFutbolin !== undefined) liga.tipoFutbolin = data.tipoFutbolin;
    if (data.premio !== undefined) liga.premio = data.premio;
    if (data.normas !== undefined) liga.normas = data.normas;
    if (data.ubicaciones !== undefined) liga.ubicaciones = data.ubicaciones;
    if (data.temporada !== undefined)
      liga.temporada = data.temporada ? new Types.ObjectId(data.temporada) : null;

    await liga.save();
    return liga;
  },

  eliminarLiga: async (id: ObjectIdLike) => {
    const liga = await LigaRepository.findById(id);
    if (!liga) throw new ApiError(404, "Liga no encontrada");

    await EnfrentamientoRepository.deleteByLiga(id);
    await LigaRepository.deleteById(id);

    return liga;
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

  eliminarEquipoDeLiga: async (
    ligaId: ObjectIdLike,
    equipoId: ObjectIdLike
  ) => {
    const liga = await LigaRepository.findById(ligaId);
    if (!liga) throw new ApiError(404, "Liga no encontrada");

    // 📌 Verificar si el equipo está inscrito
    const equipoEnLiga = liga.equipos.find((e) => {
      const id =
        e.equipo instanceof Types.ObjectId
          ? e.equipo.toString()
          : e.equipo._id?.toString();
      return id === equipoId.toString();
    });

    if (!equipoEnLiga)
      throw new ApiError(404, "El equipo no está inscrito en esta liga");

    // 🗑️ Eliminar enfrentamientos relacionados con el equipo
    await EnfrentamientoRepository.deleteByLigaAndEquipo(ligaId, equipoId);

    // 🧹 Filtrar el equipo fuera de la liga
    liga.equipos = liga.equipos.filter((e) => {
      const id =
        e.equipo instanceof Types.ObjectId
          ? e.equipo.toString()
          : e.equipo._id?.toString();
      return id !== equipoId.toString();
    });

    await liga.save();

    return liga;
  },

  cambiarEstado: async (ligaId: ObjectIdLike, nuevoEstado: EstadoLiga) => {
    const liga = await LigaRepository.findById(ligaId);
    if (!liga) throw new ApiError(404, "Liga no encontrada");

    liga.estadoLiga = nuevoEstado;
    await liga.save();

    if (nuevoEstado === EstadoLiga.EnCurso) {
      await EnfrentamientoGenerator.generarAlArrancarLiga(liga);
    }

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
