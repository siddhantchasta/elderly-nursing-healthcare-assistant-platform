import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { handleCorsOptions, withCors } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    return withCors(
      NextResponse.json(
      {
        success: true,
        message: "API is healthy and MongoDB connection is successful",
      },
      { status: 200 }
      ),
      request
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return withCors(
      NextResponse.json(
      {
        success: false,
        message: "Health check failed",
        error: message,
      },
      { status: 500 }
      ),
      request
    );
  }
}
