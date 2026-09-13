import { ValidatedRequest } from "@/types/types";
import { ok } from "@/utils/ApiResponse";
import type {
  ActualizarTemporadaBody,
  CrearTemporadaBody,
  TemporadaIdParams,
} from "recreativos-air-core/temporada";
import { TemporadaAdapter } from "./temporada.adapters";
import { TemporadaService } from "./temporada.service";

export const TemporadaController = {
  crearTemporada: async (req: ValidatedRequest<any, CrearTemporadaBody>) => {
    const temporada = await TemporadaService.crearTemporada(req.validated!);
    return ok(TemporadaAdapter.toDTO(temporada), "Temporada creada correctamente");
  },

  obtenerTemporadas: async () => {
    const temporadas = await TemporadaService.obtenerTemporadas();
    return ok(TemporadaAdapter.toDTOList(temporadas), "Temporadas obtenidas");
  },

  obtenerTemporadaActual: async () => {
    const temporada = await TemporadaService.obtenerTemporadaActual();
    return ok(
      temporada ? TemporadaAdapter.toDTO(temporada) : null,
      "Temporada actual obtenida"
    );
  },

  obtenerTemporada: async (req: ValidatedRequest<TemporadaIdParams>) => {
    const temporada = await TemporadaService.obtenerTemporadaPorId(req.params.id);
    return ok(TemporadaAdapter.toDTO(temporada), "Temporada obtenida");
  },

  actualizarTemporada: async (
    req: ValidatedRequest<TemporadaIdParams, ActualizarTemporadaBody>
  ) => {
    const temporada = await TemporadaService.actualizarTemporada(
      req.params.id,
      req.validated!
    );
    return ok(TemporadaAdapter.toDTO(temporada), "Temporada actualizada");
  },

  marcarActual: async (req: ValidatedRequest<TemporadaIdParams>) => {
    const temporada = await TemporadaService.marcarActual(req.params.id);
    return ok(TemporadaAdapter.toDTO(temporada), "Temporada marcada como actual");
  },

  eliminarTemporada: async (req: ValidatedRequest<TemporadaIdParams>) => {
    const temporada = await TemporadaService.eliminarTemporada(req.params.id);
    return ok(TemporadaAdapter.toDTO(temporada), "Temporada eliminada");
  },
};
