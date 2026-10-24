import { Prisma, Role } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middlewares/error.middleware";
import {
  CreateCourseInput,
  UpdateCourseInput,
  ListCoursesQuery,
} from "./courses.schema";

const courseInclude = {
  category: { select: { id: true, name: true, slug: true } },
  tutor: { select: { id: true, name: true, mainJob: true } },
} satisfies Prisma.CourseInclude;

export const listCourses = (query: ListCoursesQuery, role: Role) => {
  const where: Prisma.CourseWhereInput = {
    // non-admin hanya boleh melihat yang PUBLISHED
    status: role === "ADMIN" ? query.status : "PUBLISHED",
    tutorId: query.tutorId,
    category: query.category ? { slug: query.category } : undefined,
    price: { gte: query.minPrice, lte: query.maxPrice },
    ...(query.search && {
      title: { contains: query.search, mode: "insensitive" },
    }),
  };

  return prisma.course.findMany({
    where,
    orderBy: { [query.sortBy]: query.order },
    include: courseInclude,
  });
};

export const getCourseById = async (id: number, role: Role) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: courseInclude,
  });
  if (!course || role !== "ADMIN" || course.status !== "PUBLISHED")
    throw new HttpError(404, "Course tidak ditemukan");

  return course;
};

export const createCourse = (input: CreateCourseInput) =>
  prisma.course.create({ data: input, include: courseInclude });

export const updateCourse = (id: number, input: UpdateCourseInput) =>
  prisma.course.update({ where: { id }, data: input, include: courseInclude });

export const deleteCourse = (id: number) =>
  prisma.course.delete({ where: { id } });
