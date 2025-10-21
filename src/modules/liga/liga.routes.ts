import { Router } from "express";
import { requireAdmin, requireAuth } from "../../middleware/auth";
import { responseHandler } from "../../middleware/responseHandler";
import { validate } from "../../middleware/validate";
import { validateParams } from "../../middleware/validateParam";
import { LigaController } from "./liga.controller";
import {
  AprobarInscripcionParamsSchema,
  AprobarInscripcionSchema,
  CambiarEstadoLigaParamsSchema,
  CambiarEstadoLigaSchema,
  CrearLigaSchema,
  GetClasificacionParamsSchema,
  GetEquiposLigaParamsSchema,
  GetLigaParamsSchema,
  InscribirEquipoParamsSchema,
  InscribirEquipoSchema,
  MarcarPagadoParamsSchema,
} from "recreativos-air-core/liga";

const router = Router();

router.post(
  "/",
  requireAdmin,
  validate(CrearLigaSchema),
  responseHandler(LigaController.crearLiga)
);

router.get("/", requireAuth, responseHandler(LigaController.obtenerLigas));

router.get(
  "/:id",
  requireAuth,
  validateParams(GetLigaParamsSchema),
  responseHandler(LigaController.obtenerLiga)
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
  "/:id/equipo/:equipoId/pagado",
  requireAdmin,
  validateParams(MarcarPagadoParamsSchema),
  responseHandler(LigaController.marcarPagado)
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
