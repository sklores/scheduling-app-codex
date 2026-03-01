const crypto = require("crypto");

function toBase64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromBase64Url(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, "base64");
}

function signEmployeeToken(payload, secret) {
  const header = { alg: "HS256", typ: "EPT" };
  const head = toBase64Url(JSON.stringify(header));
  const body = toBase64Url(JSON.stringify(payload));
  const content = `${head}.${body}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(content)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${content}.${signature}`;
}

function timingSafeEq(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function verifyEmployeeToken(token, secret) {
  const parts = (token || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");
  const [head, body, signature] = parts;
  const content = `${head}.${body}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(content)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (!timingSafeEq(signature, expectedSig)) throw new Error("Invalid token signature");

  let payload;
  try {
    payload = JSON.parse(fromBase64Url(body).toString("utf8"));
  } catch (_) {
    throw new Error("Invalid token payload");
  }

  if (!payload || typeof payload.exp !== "number") throw new Error("Token missing exp");
  if (Date.now() >= payload.exp) throw new Error("Token expired");

  return payload;
}


module.exports = {
  signEmployeeToken,
  verifyEmployeeToken,
};
