import { requireAdmin, requireAuth } from "@/middleware/auth";
import { responseHandler } from "@/middleware/responseHandler";
import { validate } from "@/middleware/validate";
import { validateParams } from "@/middleware/validateParam";
import { Router } from "express";
import { EnfrentamientoController } from "./enfrentamiento.controller";
import { AceptarRechazarResultadoSchema, EnfrentamientoIdParamSchema, GetEnfrentamientosLigaParamsSchema, ProponerResultadoSchema } from "recreativos-air-core/enfrentamiento";

const router = Router();

router.get(
  "/liga/:ligaId",
  requireAuth,
  validateParams(GetEnfrentamientosLigaParamsSchema),
  responseHandler(EnfrentamientoController.obtenerPorLiga)
);

router.get(
  "/:id",
  requireAuth,
  validateParams(EnfrentamientoIdParamSchema),
  responseHandler(EnfrentamientoController.getEnfrentamiento)
);

router.post(
  "/:id/proponer",
  requireAuth,
  validateParams(EnfrentamientoIdParamSchema),
  validate(ProponerResultadoSchema),
  responseHandler(EnfrentamientoController.proponerResultado)
);

router.post(
  "/:id/aceptar",
  requireAuth,
  validateParams(EnfrentamientoIdParamSchema),
  validate(AceptarRechazarResultadoSchema),
  responseHandler(EnfrentamientoController.aceptarResultado)
);

router.post(
  "/:id/rechazar",
  requireAuth,
  validateParams(AceptarRechazarResultadoSchema),
  responseHandler(EnfrentamientoController.rechazarResultado)
);

router.post(
  "/:id/confirmar",
  requireAdmin,
  validateParams(EnfrentamientoIdParamSchema),
  responseHandler(EnfrentamientoController.confirmarResultadoAdmin)
);

export default router;
