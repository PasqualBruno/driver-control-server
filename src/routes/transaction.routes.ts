import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  listTransactions,
  updateTransaction,
} from "../controllers/Transaction/TransactionController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const transactionRoutes = Router();

transactionRoutes.use(authMiddleware);

transactionRoutes.post("/", createTransaction);
transactionRoutes.get("/", listTransactions);
transactionRoutes.get("/:id", getTransactionById);
transactionRoutes.patch("/:id", updateTransaction);
transactionRoutes.delete("/:id", deleteTransaction);
