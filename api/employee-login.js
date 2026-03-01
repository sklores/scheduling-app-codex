const { hashPin, signEmployeeToken } = require("./_employee-auth");
const { supabaseFetch } = require("./_supabase-rest");

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

module.exports = async function employeeLoginHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const code = (req.body && req.body.code ? String(req.body.code) : "").trim().toUpperCase();
  const pin = (req.body && req.body.pin ? String(req.body.pin) : "").trim();

  if (!code || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: "Provide employee code and 4-digit PIN" });
  }

  const secret = process.env.EMPLOYEE_PORTAL_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Missing EMPLOYEE_PORTAL_SECRET" });
  }

  try {
    const rows = await supabaseFetch(
      `/rest/v1/employees?select=id,org_id,name,pin_hash,is_active,employee_code&employee_code=eq.${encodeURIComponent(code)}&is_active=eq.true&limit=1`
    );

    const employee = Array.isArray(rows) ? rows[0] : null;
    if (!employee || !employee.pin_hash) {
      return res.status(401).json({ error: "Invalid code or PIN" });
    }

    const incomingHash = hashPin(pin);
    if (incomingHash !== employee.pin_hash) {
      return res.status(401).json({ error: "Invalid code or PIN" });
    }

    const payload = {
      employeeId: employee.id,
      orgId: employee.org_id,
      employeeName: employee.name,
      exp: Date.now() + TOKEN_TTL_MS,
    };

    const token = signEmployeeToken(payload, secret);

    return res.status(200).json({
      token,
      employee: {
        id: employee.id,
        name: employee.name,
        orgId: employee.org_id,
      },
      expiresAt: payload.exp,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Login failed" });
  }
};
