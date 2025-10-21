import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

// SERVER
export const DEVELOPMENT = process.env.NODE_ENV === "development";

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME ?? "192.168.0.19";
const SERVER_PORT = process.env.PORT
  ? Number(process.env.PORT)
  : 8080;

export const SERVER = {
  HOSTNAME: SERVER_HOSTNAME,
  PORT: SERVER_PORT,
};

// DATABASE
export const MONGO = {
  URI:
    (DEVELOPMENT ? process.env.MONGODB_URI : process.env.MONGODB_URI_PROD) ??
    "ERROR",
};
