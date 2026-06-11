export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { apiKey, fromEmail, fromName, to, subject, body } = req.body;

  if (!apiKey || !fromEmail || !to || !subject || !body) {
    return res.status(400).json({ error: "All fields required!" });
  }

  // Unsubscribe link — email encoded
  const encodedEmail = Buffer.from(to).toString("base64");
  const unsubUrl = "https://" + (req.headers.host || "yourdomain.vercel.app") + "/api/unsubscribe?e=" + encodedEmail;

  // Plain text version with tiny unsubscribe
  const plainText = body + "\n\n\n" + "Unsubscribe: " + unsubUrl;

  // HTML version — body clean, unsubscribe very small at bottom
  const htmlBody = body.replace(/\n/g, "<br>");
  const htmlEmail =
    "<!DOCTYPE html>" +
    "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'></head>" +
    "<body style='margin:0;padding:0;background:#ffffff;'>" +
    "<div style='max-width:560px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;font-size:15px;color:#222222;line-height:1.7;'>" +
    "<p>" + htmlBody + "</p>" +
    "<br>" +
    // Unsubscribe — very small, grey, bottom
    "<div style='margin-top:20px;padding-top:10px;'>" +
    "<a href='" + unsubUrl + "' style='color:#cccccc;font-size:10px;text-decoration:none;'>unsubscribe</a>" +
    "</div>" +
    "</div>" +
    "</body></html>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: (fromName ? fromName + " <" + fromEmail + ">" : fromEmail),
        to: [to],
        subject: subject,
        text: plainText,
        html: htmlEmail,
        headers: {
          "List-Unsubscribe": "<" + unsubUrl + ">",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ status: "sent", email: to });
    } else {
      return res.status(200).json({ status: "failed", email: to, error: data.message || "Send failed" });
    }
  } catch (err) {
    return res.status(200).json({ status: "failed", email: to, error: err.message });
  }
}
