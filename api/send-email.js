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

  const encoded   = Buffer.from(to).toString("base64");
  const unsubUrl  = "https://" + req.headers.host + "/api/unsubscribe?e=" + encoded;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: gmailAddress, pass: appPassword },
    tls: { rejectUnauthorized: false },
  });

  const plainText = body + "\n\n\nUnsubscribe: " + unsubUrl;

  const htmlBody  = body.replace(/\n/g, "<br>");
  const htmlEmail =
    "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>" +
    "<body style='margin:0;padding:24px;font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.7;background:#fff;'>" +
    "<div style='max-width:560px;margin:0 auto;'>" +
    htmlBody +
    "<br><br>" +
    "<a href='" + unsubUrl + "' style='color:#cccccc;font-size:10px;text-decoration:none;'>unsubscribe</a>" +
    "</div></body></html>";

  try {
    await transporter.sendMail({
      from: '"' + (senderName || gmailAddress) + '" <' + gmailAddress + '>',
      to: to,
      subject: subject,
      text: plainText,
      html: htmlEmail,
      headers: {
        "List-Unsubscribe": "<" + unsubUrl + ">",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    return res.status(200).json({ status: "sent", email: to });
  } catch (err) {
    return res.status(200).json({ status: "failed", email: to, error: err.message });
  }
}
