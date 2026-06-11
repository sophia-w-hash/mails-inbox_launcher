import nodemailer from "nodemailer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { gmailAddress, appPassword, to, subject, body, senderName } = req.body;

  if (!gmailAddress || !appPassword || !to || !subject || !body) {
    return res.status(400).json({ error: "All fields required!" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: gmailAddress,
      pass: appPassword,
    },
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.sendMail({
      from: '"' + (senderName || gmailAddress) + '" <' + gmailAddress + '>',
      to: to,
      subject: subject,
      text: body,
    });
    return res.status(200).json({ status: "sent", email: to });
  } catch (err) {
    return res.status(200).json({ status: "failed", email: to, error: err.message });
  }
}
