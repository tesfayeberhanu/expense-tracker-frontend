import {
  createSessionCookie,
  credentialsAreValid,
  sendJson,
} from "./_auth.js";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  try {
    const { username, password } = request.body ?? {};
    if (!credentialsAreValid(username, password)) {
      return sendJson(response, 401, { error: "Incorrect username or password." });
    }

    response.setHeader("Set-Cookie", createSessionCookie());
    return sendJson(response, 200, { authenticated: true });
  } catch (error) {
    console.error("Login configuration error:", error.message);
    return sendJson(response, 500, { error: "Authentication is not configured." });
  }
}

