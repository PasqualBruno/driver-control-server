import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";

export const shiftRoutes = Router();

shiftRoutes.use(authMiddleware);

shiftRoutes.post("/", createshift);
