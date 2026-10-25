import { env } from "../../config/env";
import { sendMail } from "../../lib/mailer";

// untuk mencegah XSS / HTML Injection
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );

export const sendVerificationEmail = async (
  to: string,
  fullName: string,
  token: string,
) => {
  const link = `${env.appUrl}/api/auth/verifikasi-email?token=${encodeURIComponent(token)}`;

  await sendMail({
    to,
    subject: "Verifikasi akun EduCourse kamu",
    text: `Halo ${fullName},\n\nKlik tautan berikut untuk memverifikasi email kamu:\n${link}\n\nTautan berlaku 24 jam.`,
    html: `<p>Halo ${escapeHtml(fullName)},</p>
<p>Klik tautan berikut untuk memverifikasi email kamu:</p>
<p><a href="${link}">Verifikasi email</a></p>
<p>Tautan berlaku 24 jam.</p>`,
  });
};
