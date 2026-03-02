const { supabaseFetch } = require("./_supabase-rest");

module.exports = async function bootstrapAdminHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = (req.body && req.body.user_id ? String(req.body.user_id) : "").trim();
  const email = (req.body && req.body.email ? String(req.body.email) : "").trim();

  if (!userId) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  try {
    const existingRows = await supabaseFetch(
      `/rest/v1/profiles?select=user_id,org_id,role,display_name&user_id=eq.${encodeURIComponent(userId)}&limit=1`
    );

    const existing = Array.isArray(existingRows) ? existingRows[0] : null;
    if (existing) {
      return res.status(200).json({ profile: existing, bootstrapped: false });
    }

    const orgRows = await supabaseFetch(
      "/rest/v1/orgs",
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ name: "Default Restaurant" }),
      }
    );
    const org = Array.isArray(orgRows) ? orgRows[0] : null;
    if (!org || !org.id) {
      return res.status(500).json({ error: "Failed to create org" });
    }

    const profileRows = await supabaseFetch(
      "/rest/v1/profiles",
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          user_id: userId,
          org_id: org.id,
          role: "admin",
          display_name: email || null,
        }),
      }
    );
    const profile = Array.isArray(profileRows) ? profileRows[0] : null;
    if (!profile) {
      return res.status(500).json({ error: "Failed to create profile" });
    }

    return res.status(200).json({ profile, bootstrapped: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Bootstrap failed" });
  }
};
