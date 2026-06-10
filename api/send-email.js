import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { gmailAddress, appPassword, recipients, subject, body, senderName } = req.body;

  // Validation
  if (!gmailAddress || !appPassword || !recipients?.length || !subject || !body) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  // Gmail SMTP
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

  // Plain text only — inbox friendly, low spam score
  function makeTextEmail(bodyText, sender) {
    return bodyText + "\n\n--\n" + (sender || gmailAddress);
  }

  // Simple clean HTML — no fancy design, just like a personal email
  function makeHtmlEmail(bodyText, sender) {
    // Convert newlines to <br> for HTML
    const htmlBody = bodyText.replace(/\n/g, "<br>");
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:20px;font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.7;background:#ffffff;">
  <div style="max-width:560px;margin:0 auto;">
    ${htmlBody}
    <br><br>
    <div style="color:#555;font-size:13px;border-top:1px solid #eee;padding-top:12px;margin-top:16px;">
      ${sender || gmailAddress}
    </div>
  </div>
</body>
</html>`;
  }

  const results = [];

  for (const email of recipients) {
    try {
      await transporter.sendMail({
        from: `"${senderName || gmailAddress}" <${gmailAddress}>`,
        to: email,
        replyTo: gmailAddress,
        subject: subject,
        text: makeTextEmail(body, senderName),
        html: makeHtmlEmail(body, senderName),
      });
      results.push({ email, status: "sent" });
    } catch (err) {
      results.push({ email, status: "failed", error: err.message });
    }
  }

  const sentCount = results.filter(r => r.status === "sent").length;
  return res.status(200).json({ results, sentCount, total: recipients.length });
}
