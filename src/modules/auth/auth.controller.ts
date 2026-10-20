import { Request, Response } from "express";
import { getProfile, loginUser, registerUser } from "./auth.service";

export const register = async (req: Request, res: Response) => {
  res.status(201).json(await registerUser(req.body));
};

export const login = async (req: Request, res: Response) => {
  res.json(await loginUser(req.body));
};

export const me = async (req: Request, res: Response) => {
  res.json(await getProfile(req.user!.id));
};
