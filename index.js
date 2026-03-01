const express = require("express");
const twilio = require("twilio");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/send-schedule", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "No messages provided" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(500).json({
      error: "Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your environment variables."
    });
  }

  const client = twilio(accountSid, authToken);
  const results = [];

  for (const msg of messages) {
    const { to, body } = msg;
    if (!to || !body) {
      results.push({ to, status: "skipped", reason: "Missing to or body" });
      continue;
    }
    try {
      const result = await client.messages.create({ body, from: fromNumber, to });
      results.push({ to, status: "sent", sid: result.sid });
    } catch (err) {
      results.push({ to, status: "failed", reason: err.message });
    }
  }

  const allSent  = results.every(r => r.status === "sent");
  const noneSent = results.every(r => r.status !== "sent");
  const statusCode = allSent ? 200 : noneSent ? 500 : 207;

  return res.status(statusCode).json({ results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Shift scheduler running on port ${PORT}`));
