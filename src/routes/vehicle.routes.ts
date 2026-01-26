import { Router } from "express";
import {
  create,
  getUserVehicles,
  removeVehicle,
  updateVehicle,
} from "../controllers/VehicleController";
import { authMiddleware } from "../middlewares/authMiddleware";

const vehicleRoutes = Router();

vehicleRoutes.use(authMiddleware);

vehicleRoutes.post("/", create);
vehicleRoutes.get("/", getUserVehicles);
vehicleRoutes.patch(`/:vehicleId`, updateVehicle);
vehicleRoutes.delete(`/:vehicleId`, removeVehicle);

export { vehicleRoutes };
