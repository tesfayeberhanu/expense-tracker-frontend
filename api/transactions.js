import { hasValidSession, sendJson } from "./_auth.js";

const ALLOWED_METHODS = new Set(["GET", "POST"]);

export default async function handler(request, response) {
  if (!hasValidSession(request)) {
    return sendJson(response, 401, { error: "Authentication required." });
  }

  if (!ALLOWED_METHODS.has(request.method)) {
    response.setHeader("Allow", [...ALLOWED_METHODS].join(", "));
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return sendJson(response, 500, { error: "The transaction API is not configured." });
  }

  try {
    const upstreamResponse = await fetch(
      `${apiBaseUrl.replace(/\/+$/, "")}/transactions`,
      {
        method: request.method,
        headers:
          request.method === "POST" ? { "Content-Type": "application/json" } : {},
        body: request.method === "POST" ? JSON.stringify(request.body) : undefined,
      },
    );
    const contentType = upstreamResponse.headers.get("content-type");
    const body = await upstreamResponse.text();

    response.status(upstreamResponse.status);
    response.setHeader("Cache-Control", "no-store");
    if (contentType) response.setHeader("Content-Type", contentType);
    return response.send(body);
  } catch (error) {
    console.error("Transaction API error:", error.message);
    return sendJson(response, 502, { error: "Could not reach the transaction API." });
  }
}
