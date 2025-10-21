import apiRoutes from './routes'
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler";

export const app = express();

/* Middlewares globales */
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

/* —— Rutas —— */
app.use("/api", apiRoutes);

/* —— Handler global de errores —— */
app.use(errorHandler);