import mongoose, { InferSchemaType, Schema } from "mongoose";

const verificationSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

verificationSchema.index({ email: 1 });

type VerificationCode = InferSchemaType<typeof verificationSchema>

export const VerificationModel = mongoose.model<VerificationCode>(
  "VerificationCode",
  verificationSchema
);
