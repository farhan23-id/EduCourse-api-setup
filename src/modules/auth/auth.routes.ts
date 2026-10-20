import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { login, me, register } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", verifyToken, me);

export default router;
