const ALLOWED_ORIGINS = process.env.FRONTEND_URL?.split(",") || [];
const ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

function resolveAllowedOrigin(
  request: Request
): string {
  const requestOrigin =
    request.headers.get("origin");

  if (
    requestOrigin &&
    ALLOWED_ORIGINS.includes(requestOrigin)
  ) {
    return requestOrigin;
  }

  return ALLOWED_ORIGINS[0] || "";
}

function getCorsHeaders(request: Request): HeadersInit {
  return {
    "Access-Control-Allow-Origin": resolveAllowedOrigin(request),
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

export function handleCorsOptions(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export function withCors(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  const corsHeaders = getCorsHeaders(request);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
