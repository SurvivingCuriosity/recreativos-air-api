import { ValidatedRequest } from "@/types/types";
import { ok } from "@/utils/ApiResponse";
import {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResendCodeBody,
  ResetPasswordBody,
  VerifyEmailBody,
} from "recreativos-air-core/auth";
import { UserAdapter } from "./../user/user.adapters";
import { AuthService } from "./auth.service";

export const AuthController = {
  login: async (req: ValidatedRequest<any, LoginBody>) => {
    const res = await AuthService.login(req.validated);
    return ok(res, "Login correcto");
  },

  me: async (req: ValidatedRequest) => {
    const id = req.user!.id || undefined;
    const userData = await AuthService.me(id);
    return ok(UserAdapter.toDto(userData), "Perfil obtenido correctamente");
  },

  register: async (req: ValidatedRequest<any, RegisterBody>) => {
    const res = await AuthService.register(req.validated);
    return ok(res, "Registro exitoso, revisa tu correo");
  },

  verifyEmail: async (req: ValidatedRequest<any, VerifyEmailBody>) => {
    const verifiedUser = await AuthService.verifyEmail(req.validated);
    return ok(UserAdapter.toDto(verifiedUser), "Email verificado. Bienvenido");
  },

  resendCode: async (req: ValidatedRequest<any, ResendCodeBody>) => {
    const res = await AuthService.resendCode(req.validated);
    return ok(res, "Código enviado");
  },

  forgotPassword: async (req: ValidatedRequest<any, ForgotPasswordBody>) => {
    await AuthService.forgotPassword(req.validated);
    return ok(null, "Si el correo existe, recibirás un código de recuperación");
  },

  resetPassword: async (req: ValidatedRequest<any, ResetPasswordBody>) => {
    await AuthService.resetPassword(req.validated);
    return ok(null, "Contraseña actualizada correctamente");
  },
};
