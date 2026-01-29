import { Router } from "express";
import {
  createShift,
  deleteShift,
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
shiftRoutes.delete("/:shiftId", deleteShift);
