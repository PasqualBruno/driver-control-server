import { Router } from "express";
import {
  createMaintenance,
  deleteMaintenance,
  getMaintenanceById,
  getMaintenancesByCar,
  updateMaintenance,
} from "../controllers/Maintenance/maintenanceController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const maintenanceRoutes = Router();

maintenanceRoutes.use(authMiddleware);

maintenanceRoutes.post("/", createMaintenance);
maintenanceRoutes.get("/:vehicleId", getMaintenancesByCar);
maintenanceRoutes.get("/details/:id", getMaintenanceById);
maintenanceRoutes.patch("/:id", updateMaintenance);
maintenanceRoutes.delete("/:id", deleteMaintenance);
