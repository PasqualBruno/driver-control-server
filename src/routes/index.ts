import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { vehicleRoutes } from "./vehicle.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/vehicles", vehicleRoutes);

export { routes };
