const { verifyEmployeeToken } = require("./_employee-auth");
const { supabaseFetch } = require("./_supabase-rest");

function getWeekRange() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  const start = d;
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const toISODate = (x) => x.toISOString().slice(0, 10);
  return { start: toISODate(start), end: toISODate(end) };
}

module.exports = async function employeeScheduleHandler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const secret = process.env.EMPLOYEE_PORTAL_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Missing EMPLOYEE_PORTAL_SECRET" });
  }

  let payload;
  try {
    payload = verifyEmployeeToken(token, secret);
  } catch (err) {
    return res.status(401).json({ error: err.message || "Invalid token" });
  }

  const { start, end } = getWeekRange();

  try {
    const query = [
      "select=date,start_time,end_time,notes",
      `employee_id=eq.${encodeURIComponent(payload.employeeId)}`,
      `org_id=eq.${encodeURIComponent(payload.orgId)}`,
      `date=gte.${start}`,
      `date=lte.${end}`,
      "order=date.asc,start_time.asc",
    ].join("&");

    const shifts = await supabaseFetch(`/rest/v1/shifts?${query}`);

    return res.status(200).json({
      employee: {
        id: payload.employeeId,
        name: payload.employeeName,
      },
      range: { start, end },
      shifts: Array.isArray(shifts) ? shifts : [],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch schedule" });
  }
};
