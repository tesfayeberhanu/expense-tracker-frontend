import { hasValidSession, sendJson } from "./_auth.js";

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  if (!hasValidSession(request)) {
    return sendJson(response, 401, { authenticated: false });
  }

  return sendJson(response, 200, { authenticated: true });
}

