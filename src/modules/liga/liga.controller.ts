import { LigaAdapter } from './liga.adapters';
import { ValidatedRequest } from "@/types/types";
import { ok } from "@/utils/ApiResponse";
import type {
  AprobarInscripcionBody,
  AprobarInscripcionParams,
  CambiarEstadoLigaBody,
  CambiarEstadoLigaParams,
  CrearLigaBody,
  GetClasificacionParams,
  GetEquiposLigaParams,
  GetLigaParams,
  InscribirEquipoBody,
  InscribirEquipoParams,
  MarcarPagadoParams,
} from "recreativos-air-core/liga";
import { LigaService } from "./liga.service";
import { EquipoAdapter } from '../equipo/equipo.adapters';

export const LigaController = {
  crearLiga: async (req: ValidatedRequest<any, CrearLigaBody>) => {
    const liga = await LigaService.crearLiga(req.validated, req.user!.id);
    return ok(LigaAdapter.toDTO(liga), "Liga creada correctamente");
  },

  obtenerLigas: async () => {
    const ligas = await LigaService.obtenerLigas();
    return ok(LigaAdapter.toDTOList(ligas), "Ligas obtenidas");
  },

  obtenerLiga: async (req: ValidatedRequest<GetLigaParams>) => {
    const liga = await LigaService.obtenerLigaPorId(req.params.id);
    return ok(LigaAdapter.toDTO(liga), "Liga obtenida");
  },

  inscribirEquipo: async (
    req: ValidatedRequest<InscribirEquipoParams, InscribirEquipoBody>
  ) => {
    const liga = await LigaService.inscribirEquipo(
      req.params.id,
      req.validated.equipoId
    );
    return ok(LigaAdapter.toDTO(liga), "Equipo inscrito");
  },

  aprobarInscripcion: async (
    req: ValidatedRequest<AprobarInscripcionParams, AprobarInscripcionBody>
  ) => {
    const result = await LigaService.aprobarInscripcion(
      req.params.id,
      req.params.equipoId,
      req.validated.aprobar
    );
    return ok(result, "Inscripción actualizada");
  },

  cambiarEstado: async (
    req: ValidatedRequest<CambiarEstadoLigaParams, CambiarEstadoLigaBody>
  ) => {
    const liga = await LigaService.cambiarEstado(
      req.params.id,
      req.validated.nuevoEstado
    );
    return ok(LigaAdapter.toDTO(liga), "Estado modificado");
  },

  marcarPagado: async (req: ValidatedRequest<MarcarPagadoParams>) => {
    const liga = await LigaService.marcarPagado(
      req.params.id,
      req.params.equipoId
    );
    return ok(LigaAdapter.toDTO(liga), "Equipo marcado como pagado");
  },

  obtenerEquipos: async (req: ValidatedRequest<GetEquiposLigaParams>) => {
    const equipos = await LigaService.obtenerEquipos(req.params.id);
    return ok(EquipoAdapter.toDTOList(equipos), "Equipos obtenidos");
  },

  obtenerClasificacion: async (
    req: ValidatedRequest<GetClasificacionParams>
  ) => {
    const clasificacion = await LigaService.obtenerClasificacion(req.params.id);
    return ok(clasificacion, "Clasificación generada correctamente");
  },
};
