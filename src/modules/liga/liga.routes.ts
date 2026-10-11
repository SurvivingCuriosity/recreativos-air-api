import { Router } from "express";
import {
  ActualizarJornadaSchema,
  ActualizarLigaParamsSchema,
  ActualizarLigaSchema,
  AprobarInscripcionParamsSchema,
  AprobarInscripcionSchema,
  CambiarEstadoLigaParamsSchema,
  CambiarEstadoLigaSchema,
  CrearLigaSchema,
  EliminarLigaParamsSchema,
  GetClasificacionParamsSchema,
  GetEquiposLigaParamsSchema,
  GetLigaParamsSchema,
  GetLigasQuerySchema,
  InscribirEquipoParamsSchema,
  InscribirEquipoSchema,
  JornadaNumeroParamsSchema,
  MarcarPagadoParamsSchema,
  RecalcularJornadasSchema,
} from "recreativos-air-core/liga";
import { requireAdmin, requireAuth } from "../../middleware/auth";
import { responseHandler } from "../../middleware/responseHandler";
import { validate } from "../../middleware/validate";
import { validateParams } from "../../middleware/validateParam";
import { validateQuery } from "../../middleware/validateQuery";
import { LigaController } from "./liga.controller";

const router = Router();

router.post(
  "/",
  requireAdmin,
  validate(CrearLigaSchema),
  responseHandler(LigaController.crearLiga)
);

router.get(
  "/",
  validateQuery(GetLigasQuerySchema),
  responseHandler(LigaController.obtenerLigas)
);

router.get(
  "/:id",
  requireAuth,
  validateParams(GetLigaParamsSchema),
  responseHandler(LigaController.obtenerLiga)
);

router.put(
  "/:id",
  requireAdmin,
  validateParams(ActualizarLigaParamsSchema),
  validate(ActualizarLigaSchema),
  responseHandler(LigaController.actualizarLiga)
);

router.delete(
  "/:id",
  requireAdmin,
  validateParams(EliminarLigaParamsSchema),
  responseHandler(LigaController.eliminarLiga)
);

router.post(
  "/:id/inscribir",
  requireAuth,
  validateParams(InscribirEquipoParamsSchema),
  validate(InscribirEquipoSchema),
  responseHandler(LigaController.inscribirEquipo)
);

router.patch(
  "/:id/equipo/:equipoId",
  requireAdmin,
  validateParams(AprobarInscripcionParamsSchema),
  validate(AprobarInscripcionSchema),
  responseHandler(LigaController.aprobarInscripcion)
);

router.patch(
  "/:id/estado",
  requireAdmin,
  validateParams(CambiarEstadoLigaParamsSchema),
  validate(CambiarEstadoLigaSchema),
  responseHandler(LigaController.cambiarEstado)
);

router.patch(
  "/:id/jornadas/:numero",
  requireAdmin,
  validateParams(JornadaNumeroParamsSchema),
  validate(ActualizarJornadaSchema),
  responseHandler(LigaController.actualizarJornada)
);

router.post(
  "/:id/jornadas/recalcular",
  requireAdmin,
  validateParams(GetLigaParamsSchema),
  validate(RecalcularJornadasSchema),
  responseHandler(LigaController.recalcularJornadas)
);

router.patch(
  "/:id/equipo/:equipoId/pagado",
  requireAdmin,
  validateParams(MarcarPagadoParamsSchema),
  responseHandler(LigaController.marcarPagado)
);

router.delete(
  "/:id/equipo/:equipoId",
  requireAdmin,
  validateParams(AprobarInscripcionParamsSchema),
  responseHandler(LigaController.eliminarEquipoDeLiga)
);

router.get(
  "/:id/equipos",
  requireAuth,
  validateParams(GetEquiposLigaParamsSchema),
  responseHandler(LigaController.obtenerEquipos)
);

router.get(
  "/:id/clasificacion",
  requireAuth,
  validateParams(GetClasificacionParamsSchema),
  responseHandler(LigaController.obtenerClasificacion)
);

export default router;
