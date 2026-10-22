import { Request, Response } from "express";
import { parseId } from "../../utils/parse-id";
import {
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from "./users.services";

export const getUsers = async (_req: Request, res: Response) => {
  res.json(await listUsers());
};

export const getUser = async (req: Request, res: Response) => {
  res.json(await getUserById(parseId(req.params.id), req.user!));
};

export const patchUser = async (req: Request, res: Response) => {
  res.json(await updateUser(parseId(req.params.id), req.body, req.user!));
};

export const removeUser = async (req: Request, res: Response) => {
  await deleteUser(parseId(req.params.id));
  //   res.status(204).send();
  res.sendStatus(204);
};
