import crypto from "node:crypto";

const SESSION_COOKIE = "lp_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

const encode = (value) => Buffer.from(value).toString("base64url");

const sign = (value) => {
  const secret = requireEnvironment("SESSION_SECRET");
  if (Buffer.byteLength(secret) < 32) {
    throw new Error("SESSION_SECRET must be at least 32 bytes.");
  }

  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
};

const requireEnvironment = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
};

const parseCookies = (header = "") =>
  Object.fromEntries(
    header
      .split(";")
      .map((cookie) => cookie.trim().split("="))
      .filter(([name, value]) => name && value)
      .map(([name, ...value]) => [name, decodeURIComponent(value.join("="))]),
  );

const safeEqual = (actual, expected) => {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
};

export const credentialsAreValid = (username, password) => {
  const usernameMatches = safeEqual(
    String(username ?? ""),
    requireEnvironment("LOGIN_USERNAME"),
  );
  const passwordMatches = safeEqual(
    String(password ?? ""),
    requireEnvironment("LOGIN_PASSWORD"),
  );

  return usernameMatches && passwordMatches;
};

export const createSessionCookie = () => {
  const payload = encode(
    JSON.stringify({ expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000 }),
  );
  const token = `${payload}.${sign(payload)}`;

  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`;
};

export const clearSessionCookie = () =>
  `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;

export const hasValidSession = (request) => {
  try {
    const token = parseCookies(request.headers.cookie)[SESSION_COOKIE];
    if (!token) return false;

    const [payload, signature] = token.split(".");
    if (!payload || !signature || !safeEqual(signature, sign(payload))) {
      return false;
    }

    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    return Number(session.expiresAt) > Date.now();
  } catch {
    return false;
  }
};

export const sendJson = (response, status, body) => {
  response.setHeader("Cache-Control", "no-store");
  return response.status(status).json(body);
};
