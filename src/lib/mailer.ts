import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465, // 465 = SSL langsung; port lain memakai STARTTLS jika server mendukung
  auth: env.smtp.user
    ? { user: env.smtp.user, pass: env.smtp.pass ?? "" }
    : undefined,
});

type MailOptions = { to: string; subject: string; text: string; html: string };

export const sendMail = (options: MailOptions) =>
  transporter.sendMail({ from: env.mailFrom, ...options });