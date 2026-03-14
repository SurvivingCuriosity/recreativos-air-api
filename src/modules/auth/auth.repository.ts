import { UserModel } from "../user/user.model";
import { VerificationModel } from "./auth.model";
import { PasswordResetModel } from "./passwordReset.model";

export const AuthRepository = {
  findById: async (id: string) => {
    return await UserModel.findById(id);
  },

  findByEmail: async (email: string) => {
    return await UserModel.findOne({ email });
  },

  findByUsername: async (username: string) => {
    return await UserModel.findOne({ username });
  },

  createUser: async (data: any) => {
    return await UserModel.create(data);
  },

  markVerified: async (email: string) => {
    return await UserModel.updateOne({ email }, { verified: true });
  },

  saveVerification: async (email: string, code: string, expiresAt: Date) => {
    await VerificationModel.deleteMany({ email });
    return await VerificationModel.create({ email, code, expiresAt });
  },

  findVerification: async (email: string, code: string) => {
    return await VerificationModel.findOne({ email, code });
  },

  deleteVerification: async (email: string) => {
    await VerificationModel.deleteMany({ email });
  },

  savePasswordReset: async (email: string, code: string, expiresAt: Date) => {
    await PasswordResetModel.deleteMany({ email });
    return await PasswordResetModel.create({ email, code, expiresAt });
  },

  findPasswordReset: async (email: string, code: string) => {
    return await PasswordResetModel.findOne({ email, code });
  },

  deletePasswordReset: async (email: string) => {
    await PasswordResetModel.deleteMany({ email });
  },

  updatePassword: async (email: string, hashedPassword: string) => {
    return await UserModel.updateOne({ email }, { password: hashedPassword });
  },
};
