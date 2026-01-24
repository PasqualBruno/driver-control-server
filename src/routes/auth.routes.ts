import { Router } from "express";
import {
  checkEmail,
  login,
  logout,
  register,
} from "../controllers/AuthController";

const authRoutes = Router();

authRoutes.post("/check-email", checkEmail);
authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

export { authRoutes };
