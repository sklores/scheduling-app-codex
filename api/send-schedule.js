const twilio = require("twilio");

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fromWeekStart, messages } = req.body || {};

  if (!fromWeekStart || typeof fromWeekStart !== "string") {
    return badRequest(res, "fromWeekStart is required (YYYY-MM-DD)");
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return badRequest(res, "messages must be a non-empty array");
  }

  const invalidMessage = messages.find(msg => {
    const to = msg && msg.to;
    return !to || typeof to !== "string" || !to.startsWith("+");
  });
  if (invalidMessage) {
    return badRequest(res, 'Each message.to must be a string that starts with "+"');
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(500).json({
      error: "Missing Twilio env vars. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER."
    });
  }

  const client = twilio(accountSid, authToken);
  const results = [];

  for (const msg of messages) {
    const { to, body } = msg || {};

    if (!body || typeof body !== "string") {
      results.push({ to, status: "failed", reason: "Message body is required" });
      continue;
    }

    try {
      const sent = await client.messages.create({
        to,
        from: fromNumber,
        body,
      });
      results.push({ to, status: "sent", sid: sent.sid });
    } catch (err) {
      results.push({ to, status: "failed", reason: err.message });
    }
  }

  const sentCount = results.filter(r => r.status === "sent").length;
  const failedCount = results.length - sentCount;

  return res.status(failedCount ? 207 : 200).json({
    sent: sentCount,
    failed: failedCount,
    results,
  });
};
