import { Router } from "express";
import { authorize, verifyToken } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { getUser, getUsers, patchUser, removeUser } from "./users.controller";
import { updateUserSchema } from "./users.schema";

const router = Router();

router.use(verifyToken);

router.get("/", authorize("ADMIN"), getUsers);
router.get("/:id", getUser);
router.patch("/:id", validate(updateUserSchema), patchUser);
router.delete("/:id", authorize("ADMIN"), removeUser);

export default router;
