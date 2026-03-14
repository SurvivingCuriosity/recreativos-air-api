import mongoose, { InferSchemaType, Schema } from "mongoose";

const passwordResetSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

passwordResetSchema.index({ email: 1 });

type PasswordReset = InferSchemaType<typeof passwordResetSchema>;

export const PasswordResetModel = mongoose.model<PasswordReset>(
  "PasswordReset",
  passwordResetSchema
);
