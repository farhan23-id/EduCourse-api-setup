import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middlewares/error.middleware";

const app = express();
app.disable("x-powered-by");

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(notFound);
app.use(errorHandler);

export default app;
