import cors from "cors";
import express from "express";
import { routes } from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);

app.get("/", (req, res) => {
  return res.json({ message: "Uber Driver API is running! 🚀" });
});

export { app };
