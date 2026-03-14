import { sendPasswordResetEmail, sendVerifyEmail } from "@/infra/mailservice";
import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/ApiError";
import { AuthRepository } from "./auth.repository";
import { generateOTP, generateToken } from "./auth.utils";

export const AuthService = {
  register: async (data: {
    email: string;
    username: string;
    password: string;
  }) => {
    const existingEmail = await AuthRepository.findByEmail(data.email);
    if (existingEmail) throw new ApiError(409, "El correo ya está registrado");

    const existingUsername = await AuthRepository.findByUsername(data.username);
    if (existingUsername)
      throw new ApiError(409, "El nombre de usuario ya está en uso");

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await AuthRepository.createUser({
      ...data,
      password: hashed,
      verified: false,
      admin: false,
    });

    // OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await AuthRepository.saveVerification(user.email, code, expiresAt);

    await sendVerifyEmail(user.email, code);

    return null
  },

  verifyEmail: async (data: { email: string; code: string }) => {
    const record = await AuthRepository.findVerification(data.email, data.code);
    if (!record) throw new ApiError(400, "Código inválido o inexistente");

    if (record.expiresAt < new Date()) {
      await AuthRepository.deleteVerification(data.email);
      throw new ApiError(400, "Código expirado");
    }

    await AuthRepository.markVerified(data.email);
    await AuthRepository.deleteVerification(data.email);

    const user = await AuthRepository.findByEmail(data.email);
    const token = await generateToken({ id: user!.id, admin: user!.admin });

    return { token, user }
  },

  resendCode: async (data: { email: string }) => {
    const user = await AuthRepository.findByEmail(data.email);
    if (!user) throw new ApiError(404, "Usuario no encontrado");
    if (user.verified) throw new ApiError(400, "El usuario ya está verificado");

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await AuthRepository.saveVerification(user.email, code, expiresAt);
    await sendVerifyEmail(user.email, code);

    return null
  },

  login: async (data: { email: string; password: string }) => {
    const user = await AuthRepository.findByEmail(data.email);
    if (!user) throw new ApiError(401, "Credenciales inválidas");

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new ApiError(401, "Credenciales inválidas");
    if (!user.verified) throw new ApiError(403, "Correo no verificado");

    const token = await generateToken({ id: user.id, admin: user.admin });
    return { token, user }
  },

  me: async (userId: string | undefined) => {
    if (!userId) throw new ApiError(403, "Debes iniciar sesión");
    const user = await AuthRepository.findById(userId);
    if (!user) throw new ApiError(404, "Usuario no encontrado");
    return user
  },

  forgotPassword: async (data: { email: string }) => {
    const user = await AuthRepository.findByEmail(data.email);
    // Respuesta siempre exitosa: no revelamos si el email existe
    if (!user || !user.verified) return null;

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await AuthRepository.savePasswordReset(data.email, code, expiresAt);
    await sendPasswordResetEmail(data.email, code);
    return null;
  },

  resetPassword: async (data: { email: string; code: string; password: string }) => {
    const record = await AuthRepository.findPasswordReset(data.email, data.code);
    if (!record) throw new ApiError(400, "Código inválido o inexistente");

    if (record.expiresAt < new Date()) {
      await AuthRepository.deletePasswordReset(data.email);
      throw new ApiError(400, "El código ha expirado");
    }

    const hashed = await bcrypt.hash(data.password, 10);
    await AuthRepository.updatePassword(data.email, hashed);
    await AuthRepository.deletePasswordReset(data.email);
    return null;
  },
};
