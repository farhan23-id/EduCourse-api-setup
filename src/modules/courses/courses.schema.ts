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

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
