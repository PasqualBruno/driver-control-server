import { Router } from "express";
import {
  createShift,
  getShiftDetails,
  listShiftsByVehicle,
  updateShift,
} from "../controllers/Shift/shiftController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const shiftRoutes = Router();

shiftRoutes.use(authMiddleware);

shiftRoutes.post("/", createShift);
shiftRoutes.get("/:vehicleId", listShiftsByVehicle);
shiftRoutes.get("/details/:shiftId", getShiftDetails);
shiftRoutes.patch("/:shiftId", updateShift);
