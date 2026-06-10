import nodemailer from "nodemailer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { gmailAddress, appPassword, recipients, subject, body, senderName } = req.body;

  if (!gmailAddress || !appPassword || !recipients?.length || !subject || !body) {
    return res.status(400).json({ error: "Saari fields required hain!" });
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

  const results = [];

  for (const email of recipients) {
    try {
      await transporter.sendMail({
        from: `"${senderName || "Fast Mail"}" <${gmailAddress}>`,
        to: email,
        replyTo: gmailAddress,
        subject: subject,
        text: body.replace(/<[^>]*>/g, ""),
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;padding:36px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
        <tr><td style="color:#222;font-size:15px;line-height:1.8;">${body}</td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid #eee;color:#999;font-size:12px;text-align:center;">
          Sent by ${senderName || gmailAddress}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        headers: {
          "X-Priority": "3",
          "Importance": "Normal",
        },
      });
      results.push({ email, status: "sent" });
    } catch (err) {
      results.push({ email, status: "failed", error: err.message });
    }
  }

  const sentCount = results.filter(r => r.status === "sent").length;
  return res.status(200).json({ results, sentCount, total: recipients.length });
}
