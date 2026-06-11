export default async function handler(req, res) {
  const { e } = req.query;
  if (!e) return res.status(400).send("Invalid link.");
  try {
    const email = Buffer.from(e, "base64").toString("utf-8");
    return res.status(200).send(
      "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'><title>Unsubscribed</title></head>" +
      "<body style='margin:0;padding:40px;font-family:Arial,sans-serif;text-align:center;background:#f9f9f9;'>" +
      "<div style='max-width:400px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 12px rgba(0,0,0,0.08);'>" +
      "<div style='font-size:40px;margin-bottom:16px;'>✅</div>" +
      "<h2 style='color:#222;font-size:20px;margin-bottom:10px;'>Unsubscribed</h2>" +
      "<p style='color:#666;font-size:14px;'>" + email + " removed from list.</p>" +
      "</div></body></html>"
    );
  } catch (err) {
    return res.status(400).send("Invalid link.");
  }
}
