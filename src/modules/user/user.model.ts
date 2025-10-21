import mongoose, { InferSchemaType, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    nombre: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    movil: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = mongoose.model<User>("User", userSchema);
