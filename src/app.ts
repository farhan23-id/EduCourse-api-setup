import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import courseRoutes from "./modules/courses/courses.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import { UPLOAD_DIR } from "./modules/upload/upload.service";
import { notFound, errorHandler } from "./middlewares/error.middleware";

const app = express();
app.disable("x-powered-by");

app.use(cors());
app.use(express.json());

// file yang sudah diunggah bisa diakses lewat /uploads/<nama-file>
app.use(
  "/uploads",
  express.static(UPLOAD_DIR, {
    setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
  }),
);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
