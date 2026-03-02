module.exports = async function ownerLoginHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const password = (req.body && req.body.password ? String(req.body.password) : "").trim();
  const expected = process.env.OWNER_PASSWORD;

  if (!expected) {
    return res.status(500).json({ error: "Missing OWNER_PASSWORD" });
  }

  if (!password || password !== expected) {
    return res.status(401).json({ error: "Invalid password" });
  }

  return res.status(200).json({ ok: true });
};
