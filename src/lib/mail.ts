import nodemailer from "nodemailer";

export async function sendMail({ to, subject, text }: { to: string; subject: string; text: string }) {
  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SMTP não configurado. Não foi possível enviar o e-mail.");
  }
  console.info(`[E-MAIL DE DESENVOLVIMENTO] Para: ${to}\nAssunto: ${subject}\n${text}`);
}
