import { responseHandler } from "@/middleware/responseHandler";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { AuthController } from "./auth.controller";
import { LoginSchema, RegisterSchema, ResendCodeSchema, VerifyEmailSchema } from "recreativos-air-core/auth";

const router = Router();

router.post(
  "/login",
  validate(LoginSchema),
  responseHandler(AuthController.login)
);

router.get("/me", requireAuth, responseHandler(AuthController.me));

router.post(
  "/register",
  validate(RegisterSchema),
  responseHandler(AuthController.register)
);

router.post(
  "/verify-email",
  validate(VerifyEmailSchema),
  responseHandler(AuthController.verifyEmail)
);

router.post(
  "/resend-code",
  validate(ResendCodeSchema),
  responseHandler(AuthController.resendCode)
);

export default router;
