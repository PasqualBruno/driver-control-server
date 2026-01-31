import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { historyRoutes } from "./history.routes";
import { maintenanceRoutes } from "./maintenance.routes";
import { shiftRoutes } from "./shift.routes";
import { transactionRoutes } from "./transaction.routes";
import { vehicleRoutes } from "./vehicle.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/vehicles", vehicleRoutes);
routes.use("/transactions", transactionRoutes);
routes.use("/maintenances", maintenanceRoutes);
routes.use("/shifts", shiftRoutes);
routes.use("/maintenances/history", historyRoutes);

export { routes };
