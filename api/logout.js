import {
  clearSessionCookie,
  hasValidSession,
  requireSameOrigin,
  sendJson,
} from "./_auth.js";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  if (!requireSameOrigin(request, response)) return;
  if (!hasValidSession(request)) {
    return sendJson(response, 401, { error: "Authentication required." });
  }

  response.setHeader("Set-Cookie", clearSessionCookie());
  return sendJson(response, 200, { authenticated: false });
}
