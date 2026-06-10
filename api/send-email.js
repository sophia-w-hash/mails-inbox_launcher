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
    auth: { user: gmailAddress, pass: appPassword },
    tls: { rejectUnauthorized: false },
  });

  const htmlBody = body.replace(/\n/g, "<br>");

  try {
    await transporter.sendMail({
      from: '"' + (senderName || gmailAddress) + '" <' + gmailAddress + '>',
      to: to,
      replyTo: gmailAddress,
      subject: subject,
      text: body + "\n\n--\n" + (senderName || gmailAddress),
      html: "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='margin:0;padding:20px;font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.7;'><div style='max-width:560px;margin:0 auto;'>" + htmlBody + "<br><br><div style='color:#555;font-size:13px;border-top:1px solid #eee;padding-top:12px;'>" + (senderName || gmailAddress) + "</div></div></body></html>",
    });
    return res.status(200).json({ status: "sent", email: to });
  } catch (err) {
    return res.status(200).json({ status: "failed", email: to, error: err.message });
  }
}
