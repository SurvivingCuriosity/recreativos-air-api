import { ApiError } from "@/utils/ApiError";
import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
ZodError;
export const validate =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Error de validación zod",
        result?.error?.issues?.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })) || {}
      );
    }
    req.validated = result.data;
    next();
  };
