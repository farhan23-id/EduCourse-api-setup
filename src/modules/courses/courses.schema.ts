import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().trim().min(3),
  slug: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya huruf kecil, angka, dan tanda hubung",
    ),
  description: z.string().trim().optional(),
  thumbnailUrl: z.url().optional(),
  previewVideoUrl: z.url().optional(),
  price: z.number().int().min(0).default(0),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  categoryId: z.number().int().positive(),
  tutorId: z.number().int().positive(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const listCoursesQuerySchema = z
  .object({
    // search: cari berdasarkan judul (tidak peka huruf besar/kecil)
    search: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    tutorId: z.coerce.number().int().positive().optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    sortBy: z.enum(["title", "price"]).default("title"),
    order: z.enum(["asc", "desc"]).default("asc"),

    // hanya berlaku untuk ADMIN
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  })
  .refine(
    (q) =>
      q.minPrice === undefined ||
      q.maxPrice === undefined ||
      q.minPrice <= q.maxPrice,
    {
      message: "minPrice tidak boleh lebih besar dari maxPrice",
      path: ["minPrice"],
    },
  );

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
