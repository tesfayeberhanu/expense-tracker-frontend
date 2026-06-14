import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";

import { createSessionCookie } from "../api/_auth.js";
import login from "../api/login.js";
import logout from "../api/logout.js";
import session from "../api/session.js";
import settings from "../api/settings.js";
import transactions from "../api/transactions.js";

process.env.LOGIN_USERNAME = "admin";
process.env.LOGIN_PASSWORD = "a-secure-test-password";
process.env.SESSION_SECRET = "a-test-session-secret-that-is-longer-than-32-bytes";

const request = (method, headers = {}, body) => ({
  method,
  headers: {
    host: "finance.example.com",
    "x-forwarded-proto": "https",
    ...headers,
  },
  body,
});

const response = () => ({
  body: undefined,
  headers: new Map(),
  statusCode: undefined,
  setHeader(name, value) {
    this.headers.set(name.toLowerCase(), value);
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
  send(body) {
    this.body = body;
    return this;
  },
});

test("rejects unauthenticated private API requests", async () => {
  for (const [handler, apiRequest] of [
    [session, request("GET")],
    [logout, request("POST")],
    [settings, request("GET")],
    [transactions, request("GET")],
  ]) {
    const apiResponse = response();
    await handler(apiRequest, apiResponse);
    assert.equal(apiResponse.statusCode, 401);
  }
});

test("allows authenticated logout and clears the session cookie", () => {
  const cookie = createSessionCookie().split(";")[0];
  const apiResponse = response();

  logout(request("POST", { cookie }), apiResponse);

  assert.equal(apiResponse.statusCode, 200);
  assert.match(apiResponse.headers.get("set-cookie"), /Max-Age=0/);
});

test("rejects cross-site state-changing requests", async () => {
  const crossSiteHeaders = {
    origin: "https://attacker.example",
    "sec-fetch-site": "cross-site",
  };

  for (const [handler, apiRequest] of [
    [login, request("POST", crossSiteHeaders, {})],
    [logout, request("POST", crossSiteHeaders)],
    [settings, request("PUT", crossSiteHeaders, {})],
    [transactions, request("POST", crossSiteHeaders, {})],
  ]) {
    const apiResponse = response();
    await handler(apiRequest, apiResponse);
    assert.equal(apiResponse.statusCode, 403);
    assert.deepEqual(apiResponse.body, {
      error: "Cross-site request rejected.",
    });
  }
});

test("rejects direct browser navigation to transactions", async () => {
  const cookie = createSessionCookie().split(";")[0];
  const apiResponse = response();

  await transactions(
    request("GET", {
      accept: "text/html,application/xhtml+xml",
      cookie,
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
    }),
    apiResponse,
  );

  assert.equal(apiResponse.statusCode, 404);
  assert.deepEqual(apiResponse.body, { error: "API endpoint not found." });
});
