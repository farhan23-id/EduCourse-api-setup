import { HttpError } from "../middlewares/error.middleware";

export const parseId = (value: unknown): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0)
    throw new HttpError(400, "ID tidak valid");
  return id;
};
