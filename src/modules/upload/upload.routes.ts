import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware";
import { uploadImage } from "./upload.controller";
import { uploadSingleImage } from "./upload.service";

const router = Router();

router.post("/", verifyToken, uploadSingleImage, uploadImage);

export default router;
