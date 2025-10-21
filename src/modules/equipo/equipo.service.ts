import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { EquipoRepository } from "./equipo.repository";
import { EstadoJugadorEnEquipo } from "recreativos-air-core/equipos";
import { EquipoDoc } from "./equipo.model";

interface CrearEquipoDTO {
  nombre: string;
  color?: string;
  jugadores: {
    nombre: string;
    idUsuario?: string | null;
    suplente?: boolean;
  }[];
  creadorId?: string;
  creadorEsAdmin?: boolean;
}

export const EquipoService = {
  crearEquipo: async (data: CrearEquipoDTO) => {
    const { nombre, color, jugadores, creadorId, creadorEsAdmin } = data;

    // 🔍 Verificar nombre duplicado
    const existente = await EquipoRepository.findAll();
    if (
      existente.some((e) => e.nombre.toLowerCase() === nombre.toLowerCase())
    ) {
      throw new ApiError(409, "Ya existe un equipo con ese nombre");
    }

    // 🧩 Normalizar jugadores
    const jugadoresProcesados = jugadores.map((j) => {
      const esSinCuenta = !j.idUsuario;
      const esCreador = creadorId && j.idUsuario === creadorId;

      return {
        nombre: j.nombre.trim(),
        idUsuario: j.idUsuario ? new Types.ObjectId(j.idUsuario) : null,
        estado:
          esSinCuenta || esCreador
            ? EstadoJugadorEnEquipo.ACEPTADO
            : EstadoJugadorEnEquipo.PENDIENTE,
        suplente: j.suplente ?? false,
      };
    });

    // 👤 Añadir el creador si no está en la lista
    const yaIncluyeCreador =
      creadorId &&
      jugadoresProcesados.some(
        (j) => j.idUsuario?.toString() === creadorId.toString()
      );

    if (!creadorEsAdmin && creadorId && !yaIncluyeCreador) {
      jugadoresProcesados.push({
        nombre: "Creador",
        idUsuario: new Types.ObjectId(creadorId),
        estado: EstadoJugadorEnEquipo.ACEPTADO,
        suplente: false,
      });
    }

    // 🧠 Validar suplente
    const suplentes = jugadoresProcesados.filter((j) => j.suplente);
    if (suplentes.length > 1)
      throw new ApiError(400, "Solo puede haber un suplente por equipo");

    // ⚙️ Crear equipo
    const nuevoEquipo = await EquipoRepository.create({
      nombre,
      color,
      jugadores: jugadoresProcesados as unknown as EquipoDoc["jugadores"],
      idCreador: creadorId ? new Types.ObjectId(creadorId) : undefined,
    });

    return nuevoEquipo;
  },

  obtenerEquiposUsuario: async (userId: string) => {
    return EquipoRepository.findByUserId(userId);
  },

  responderInvitacion: async (
    equipoId: string,
    userId: string,
    aceptar: boolean
  ) => {
    const equipo = await EquipoRepository.findById(equipoId);
    if (!equipo) throw new ApiError(404, "Equipo no encontrado");

    const jugador = equipo.jugadores.find(
      (j) => j.idUsuario?.toString() === userId
    );
    if (!jugador) throw new ApiError(400, "No estás invitado a este equipo");

    jugador.estado = aceptar
      ? EstadoJugadorEnEquipo.ACEPTADO
      : EstadoJugadorEnEquipo.RECHAZADO;

    await EquipoRepository.updateById(equipoId, {
      jugadores: equipo.jugadores,
    });
    return { equipoId, nuevoEstado: jugador.estado };
  },

  obtenerEquipoPorId: async (id: string) => {
    return EquipoRepository.findById(id);
  },
};
