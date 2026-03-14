import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === "465", // true solo si 465
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendVerifyEmail(to:string, code:string) {
  const info = await transporter.sendMail({
    from: `${process.env.APP_NAME} <${process.env.FROM_EMAIL}>`,
    to,
    subject: "Verifica tu correo",
    text: `Tu código es: ${code}`,
    html: `<p>Tu código es: <b>${code}</b></p>`,
  });
  return info.messageId;
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const info = await transporter.sendMail({
    from: `${process.env.APP_NAME} <${process.env.FROM_EMAIL}>`,
    to,
    subject: "Recupera tu contraseña",
    text: `Tu código de recuperación es: ${code}. Expira en 30 minutos.`,
    html: `<p>Tu código de recuperación es: <b>${code}</b></p><p>Expira en 30 minutos.</p>`,
  });
  return info.messageId;
}

