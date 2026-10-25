import { Request, Response } from "express";
import { env } from "../../config/env";
import { HttpError } from "../../middlewares/error.middleware";

export const uploadImage = async (req: Request, res: Response) => {
  if (!req.file)
    throw new HttpError(400, "File gambar wajib diunggah (nama field: image)");

  res.status(201).json({
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `${env.appUrl}/uploads/${req.file.filename}`,
  });
};
