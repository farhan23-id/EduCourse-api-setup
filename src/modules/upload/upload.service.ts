import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { HttpError } from "../../middlewares/error.middleware";

// membuat folder uploads (jika belum ada)
export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

//  tipe yang diizinkan
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  // nama file dibuat sendiri (UUID), nama asli dari user tidak dipakai
  filename: (_req, file, cb) =>
    cb(null, `${uuidv4()}${ALLOWED_TYPES[file.mimetype]}`),
});

export const uploadSingleImage = multer({
  storage,
  // maksimal 2 MB dan hanya 1 file
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (Object.hasOwn(ALLOWED_TYPES, file.mimetype)) return cb(null, true);
    cb(
      new HttpError(
        400,
        "Hanya file gambar JPG, PNG, atau WEBP yang diperbolehkan",
      ),
    );
  },
}).single("image");
