import cors from "cors";
import express from "express";
import { routes } from "./routes";

const app = express();

// --- Middlewares Globais ---
app.use(cors()); // Libera acesso externo (Frontend)
app.use(express.json());

// --- Rotas ---
app.use(routes);

// (Opcional) Rota de Health Check para saber se a API está viva
app.get("/", (req, res) => {
  return res.json({ message: "Uber Driver API is running! 🚀" });
});

export { app };
