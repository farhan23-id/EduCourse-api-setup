import { Router } from "express";
import { authorize, verifyToken } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  getCourse,
  getCourses,
  patchCourse,
  removeCourse,
  postCourse,
} from "./courses.controller";
import { createCourseSchema, updateCourseSchema } from "./courses.schema";

const router = Router();

// semua endpoint wajib login
router.use(verifyToken);

router.get("/", getCourses);
router.get("/:id", getCourse);
router.post("/", authorize("ADMIN"), validate(createCourseSchema), postCourse);
router.patch(
  "/:id",
  authorize("ADMIN"),
  validate(updateCourseSchema),
  patchCourse,
);
router.delete("/:id", authorize("ADMIN"), removeCourse);

export default router;
