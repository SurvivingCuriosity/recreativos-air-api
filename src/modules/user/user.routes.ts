import { responseHandler } from "@/middleware/responseHandler";
import { validateQuery } from "@/middleware/validateQuery";
import { Router } from "express";
import { requireAdmin, requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { validateParams } from "../../middleware/validateParam";
import { UserController } from "./user.controller";
import {
  BuscarUsuariosQuery,
  GetUserByIdParamsSchema,
  UpdateUserSchema,
} from "recreativos-air-core/user";

const router = Router();

router.get(
  "/",
  requireAdmin,
  responseHandler(UserController.getAllUsers)
);

router.put(
  "/me",
  requireAuth,
  validate(UpdateUserSchema),
  responseHandler(UserController.updateUser)
);

router.get(
  "/buscar",
  requireAuth,
  validateQuery(BuscarUsuariosQuery),
  responseHandler(UserController.buscarUsuarios)
);

router.get(
  "/:id",
  requireAuth,
  validateParams(GetUserByIdParamsSchema),
  responseHandler(UserController.getUserById)
);

export default router;
