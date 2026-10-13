import express from "express";
import cors from "cors";

const app = express();
app.disable("x-powered-by");

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok"}));

export default app;