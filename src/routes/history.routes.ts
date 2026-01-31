import { Router } from "express";
import {
  createHistory,
  deleteMaintenanceHistory,
  historyDetails,
  listHistory,
  updateMaintenanceHistory,
} from "../controllers/maintenanceHistory/maintenanceHistoryController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const historyRoutes = Router();

historyRoutes.use(authMiddleware);

historyRoutes.post("/", createHistory);
historyRoutes.get("/list/:maintenanceId", listHistory);
historyRoutes.get("/details/:historyId", historyDetails);
historyRoutes.patch("/:historyId", updateMaintenanceHistory);
historyRoutes.delete("/:historyId", deleteMaintenanceHistory);
