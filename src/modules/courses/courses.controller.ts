import { Request, Response } from "express";
import { parseId } from "../../utils/parse-id";
import {
  getCourseById,
  createCourse,
  deleteCourse,
  listCourses,
  updateCourse,
} from "./courses.service";
import { listCoursesQuerySchema } from "./courses.schema";

export const getCourses = async (req: Request, res: Response) => {
  const query = listCoursesQuerySchema.parse(req.query);
  res.json(await listCourses(query, req.user!.role));
};

export const getCourse = async (req: Request, res: Response) => {
  res.json(await getCourseById(parseId(req.params.id), req.user!.role));
};

export const postCourse = async (req: Request, res: Response) => {
  res.status(201).json(await createCourse(req.body));
};

export const patchCourse = async (req: Request, res: Response) => {
  res.json(await updateCourse(parseId(req.params.id), req.body));
};

export const removeCourse = async (req: Request, res: Response) => {
  await deleteCourse(parseId(req.params.id));
  res.sendStatus(204);
};
