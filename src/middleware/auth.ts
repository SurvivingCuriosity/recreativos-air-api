import { NextFunction, Request, Response } from "express";
import { verifyToken } from "@/modules/auth/auth.utils";
import { ApiError } from "@/utils/ApiError";

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Token no proporcionado");
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyToken(token);
    req.user = { id: payload.id, admin: payload.admin };
    next();
  } catch (err) {
    throw new ApiError(401, "Token inválido o expirado");
  }
};


export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    throw new ApiError(401, "Token no proporcionado");

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyToken(token);
    if (payload.admin !== true)
      throw new ApiError(403, "Acceso denegado: no eres administrador");

    req.user = { id: payload.id, admin: payload.admin };
    return next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, "Token inválido o expirado");
  }
};
