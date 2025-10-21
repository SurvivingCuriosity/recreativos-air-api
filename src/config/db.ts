import mongoose from "mongoose";
import { MONGO } from "@/config";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return mongoose;

  mongoose.set("strictQuery", true);

  await mongoose.connect(MONGO.URI, {
    maxPoolSize: 10,
    autoIndex: false, // genera índices desde CI, no en runtime
  });

  isConnected = true;

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
  });
  console.log(`🚀 Base de datos conectada`);
  return mongoose;
};

/** Desconexión limpia: útil en tests o shutdowns controlados */
export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};
