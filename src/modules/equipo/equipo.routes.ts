import { Router } from "express";
import { requireAdmin, requireAuth } from "../../middleware/auth";
import { responseHandler } from "../../middleware/responseHandler";
import { validate } from "../../middleware/validate";
import { validateParams } from "../../middleware/validateParam";
import { EquipoController } from "./equipo.controller";
import { CrearEquipoSchema, GetEquiposDeUsuarioParamsSchema, InvitacionEquipoSchema } from "recreativos-air-core/equipos";

const router = Router();


router.get(
  "/",
  requireAdmin,
  responseHandler(EquipoController.getAllEquipos)
);

router.post(
  "/",
  requireAuth,
  validate(CrearEquipoSchema),
  responseHandler(EquipoController.crearEquipo)
);

router.get(
  "/usuario/:id",
  requireAuth,
  validateParams(GetEquiposDeUsuarioParamsSchema),
  responseHandler(EquipoController.obtenerEquiposUsuario)
);

router.get(
  "/:id",
  requireAuth,
  responseHandler(EquipoController.obtenerEquipo)
);

router.patch(
  "/invitacion",
  requireAuth,
  validate(InvitacionEquipoSchema),
  responseHandler(EquipoController.aceptarInvitacion)
);

export default router;
