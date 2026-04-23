import { NextResponse } from "next/server";
import { AuthTokenPayload, verifyAuthToken } from "@/lib/auth";
import { UserRole } from "@/models/User";

interface AuthResult {
  auth: AuthTokenPayload | null;
  response: NextResponse | null;
}

function unauthorizedResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );
}

function forbiddenResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 403 }
  );
}

export function authenticateRequest(request: Request, allowedRoles?: UserRole[]): AuthResult {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return {
      auth: null,
      response: unauthorizedResponse("Authorization header is required"),
    };
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return {
      auth: null,
      response: unauthorizedResponse("Authorization header must be in Bearer token format"),
    };
  }

  try {
    const auth = verifyAuthToken(token);

    if (allowedRoles && !allowedRoles.includes(auth.role)) {
      return {
        auth: null,
        response: forbiddenResponse("Insufficient role permissions"),
      };
    }

    return {
      auth,
      response: null,
    };
  } catch {
    return {
      auth: null,
      response: unauthorizedResponse("Invalid or expired token"),
    };
  }
}