import { clearSessionCookie, sendJson } from "./_auth.js";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  response.setHeader("Set-Cookie", clearSessionCookie());
  return sendJson(response, 200, { authenticated: false });
}

