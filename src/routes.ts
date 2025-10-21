import { Router } from "express";
import userRouter from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import equipoRoutes from "./modules/equipo/equipo.routes";
import ligaRoutes from "./modules/liga/liga.routes";
import enfrentamientoRoutes from "./modules/enfrentamiento/enfrentamiento.routes";

const router = Router();

router.use("/users", userRouter);
router.use("/auth", authRoutes);
router.use("/equipos", equipoRoutes);
router.use("/ligas", ligaRoutes);
router.use("/enfrentamientos", enfrentamientoRoutes);

export default router;
