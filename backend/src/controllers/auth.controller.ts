import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { REGISTERABLE_ROLES, RegisterableRole, registerAccount } from "@/services/auth.service";

interface RegisterRequestBody {
  email?: string;
  password?: string;
  role?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isRegisterableRole(role: string): role is RegisterableRole {
  return REGISTERABLE_ROLES.includes(role as RegisterableRole);
}

export async function registerController(request: Request) {
  let body: RegisterRequestBody;

  try {
    body = (await request.json()) as RegisterRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const email = body.email?.trim();
  const password = body.password;
  const role = body.role;

  if (!email || !password || !role) {
    return NextResponse.json(
      {
        success: false,
        message: "email, password, and role are required",
      },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid email format",
      },
      { status: 400 }
    );
  }

  if (!isRegisterableRole(role)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid role. Allowed roles: user, caregiver",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const createdUser = await registerAccount({
      email,
      password,
      role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account registered successfully",
        data: createdUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
        error: message,
      },
      { status: 500 }
    );
  }
}