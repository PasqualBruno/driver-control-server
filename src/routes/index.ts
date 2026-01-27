import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { transactionRoutes } from "./transaction.routes";
import { vehicleRoutes } from "./vehicle.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/vehicles", vehicleRoutes);
routes.use("/transactions", transactionRoutes);
routes.use("/maintenances", transactionRoutes);

export { routes };
