import { Router } from "express";
import {
  ActualizarTemporadaSchema,
  CrearTemporadaSchema,
  TemporadaIdParamsSchema,
} from "recreativos-air-core/temporada";
import { requireAdmin } from "../../middleware/auth";
import { responseHandler } from "../../middleware/responseHandler";
import { validate } from "../../middleware/validate";
import { validateParams } from "../../middleware/validateParam";
import { TemporadaController } from "./temporada.controller";

const router = Router();

router.post(
  "/",
  requireAdmin,
  validate(CrearTemporadaSchema),
  responseHandler(TemporadaController.crearTemporada)
);

router.get("/", responseHandler(TemporadaController.obtenerTemporadas));

router.get("/actual", responseHandler(TemporadaController.obtenerTemporadaActual));

router.get(
  "/:id",
  requireAdmin,
  validateParams(TemporadaIdParamsSchema),
  responseHandler(TemporadaController.obtenerTemporada)
);

router.put(
  "/:id",
  requireAdmin,
  validateParams(TemporadaIdParamsSchema),
  validate(ActualizarTemporadaSchema),
  responseHandler(TemporadaController.actualizarTemporada)
);

router.patch(
  "/:id/actual",
  requireAdmin,
  validateParams(TemporadaIdParamsSchema),
  responseHandler(TemporadaController.marcarActual)
);

router.delete(
  "/:id",
  requireAdmin,
  validateParams(TemporadaIdParamsSchema),
  responseHandler(TemporadaController.eliminarTemporada)
);

export default router;
