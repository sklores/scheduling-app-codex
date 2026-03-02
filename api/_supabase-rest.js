function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return { url, serviceKey };
}

async function supabaseFetch(path, options = {}) {
  const { url, serviceKey } = getSupabaseConfig();
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const msg = (data && (data.message || data.error_description || data.error)) || `Supabase REST error ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

module.exports = {
  supabaseFetch,
};
