import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
};

const prismaCode = (err: unknown): string | undefined =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  typeof err.code === "string"
    ? err.code
    : undefined;

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ message: "Validasi gagal", errors: err.issues });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: "Ukuran file terlalu besar (maksimal 2 MB)",
      LIMIT_UNEXPECTED_FILE:
        "Gunakan field bernama 'image' untuk mengunggah file",
    };
    return res
      .status(400)
      .json({ message: messages[err.code] ?? `Upload gagal: ${err.message}` });
  }

  const code = prismaCode(err);
  if (code === "P2025")
    return res.status(404).json({ message: "Data tidak ditemukan" });
  if (code === "P2002")
    return res.status(409).json({ message: "Data sudah ada (duplikat)" });
  if (code === "P2023")
    return res
      .status(400)
      .json({ message: "Data referensi (kategori/tutor) tidak ditemukan" });

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
