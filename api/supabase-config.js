module.exports = function supabaseConfigHandler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const authDisabled = String(process.env.AUTH_DISABLED || "").toLowerCase() === "true";
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!authDisabled && (!url || !anonKey)) {
    return res.status(500).json({
      error: "Missing required Supabase environment variables: SUPABASE_URL and/or SUPABASE_ANON_KEY",
    });
  }

  return res.status(200).json({ url, anonKey, authDisabled });
};
