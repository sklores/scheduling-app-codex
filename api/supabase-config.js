module.exports = function supabaseConfigHandler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return res.status(500).json({
      error: "Missing required Supabase environment variables: SUPABASE_URL and/or SUPABASE_ANON_KEY",
    });
  }

  return res.status(200).json({ url, anonKey });
};
