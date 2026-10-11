import { ObjectIdLike } from "@/types/types";
import { Types } from "mongoose";
import {
  ActualizarTemporadaBody,
  CrearTemporadaBody,
} from "recreativos-air-core/temporada";
import { ApiError } from "../../utils/ApiError";
import { LigaRepository } from "../liga/liga.repository";
import { Temporada } from "./temporada.model";
import { TemporadaRepository } from "./temporada.repository";
import { toFechaDate as toFecha } from "@/utils/fecha";

// Las ligas seleccionadas pasan a la temporada; las que estaban y ya no, quedan sin temporada
const sincronizarLigas = async (
  temporadaId: ObjectIdLike,
  ligaIds: string[]
) => {
  const ids = [...new Set(ligaIds)];
  if (ids.some((id) => !Types.ObjectId.isValid(id)))
    throw new ApiError(400, "ID de liga inválido");

  const existentes = await LigaRepository.countByIds(ids);
  if (existentes !== ids.length)
    throw new ApiError(404, "Alguna de las ligas no existe");

  await LigaRepository.clearTemporadaExcept(temporadaId, ids);
  await LigaRepository.setTemporada(ids, temporadaId);
};

export const TemporadaService = {
  crearTemporada: async (data: CrearTemporadaBody) => {
    const temporada = await TemporadaRepository.create({
      nombre: data.nombre,
      fechaInicio: toFecha(data.fechaInicio),
      fechaFin: toFecha(data.fechaFin),
      actual: false,
    });

    if (data.ligas.length) await sincronizarLigas(temporada._id, data.ligas);
    if (data.actual) return TemporadaService.marcarActual(temporada._id);

    return temporada;
  },

  obtenerTemporadas: async () => {
    return TemporadaRepository.findAll();
  },

  obtenerTemporadaActual: async () => {
    return TemporadaRepository.findActual();
  },

  obtenerTemporadaPorId: async (id: ObjectIdLike) => {
    const temporada = await TemporadaRepository.findById(id);
    if (!temporada) throw new ApiError(404, "Temporada no encontrada");
    return temporada;
  },

  actualizarTemporada: async (
    id: ObjectIdLike,
    data: ActualizarTemporadaBody
  ) => {
    const temporada = await TemporadaRepository.findById(id);
    if (!temporada) throw new ApiError(404, "Temporada no encontrada");

    const cambios: Partial<Temporada> = {};
    if (data.nombre !== undefined) cambios.nombre = data.nombre;
    if (data.fechaInicio !== undefined)
      cambios.fechaInicio = toFecha(data.fechaInicio);
    if (data.fechaFin !== undefined) cambios.fechaFin = toFecha(data.fechaFin);

    const actualizada = await TemporadaRepository.updateById(id, cambios);
    if (data.ligas !== undefined) await sincronizarLigas(id, data.ligas);

    return actualizada!;
  },

  marcarActual: async (id: ObjectIdLike) => {
    const temporada = await TemporadaRepository.findById(id);
    if (!temporada) throw new ApiError(404, "Temporada no encontrada");

    await TemporadaRepository.unsetActualExcept(id);
    const actualizada = await TemporadaRepository.updateById(id, {
      actual: true,
    });

    return actualizada!;
  },

  eliminarTemporada: async (id: ObjectIdLike) => {
    const temporada = await TemporadaRepository.findById(id);
    if (!temporada) throw new ApiError(404, "Temporada no encontrada");

    await LigaRepository.clearTemporada(id);
    await TemporadaRepository.deleteById(id);

    return temporada;
  },
};
