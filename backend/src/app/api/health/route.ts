import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();

    return NextResponse.json(
      {
        success: true,
        message: "API is healthy and MongoDB connection is successful",
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Health check failed",
        error: message,
      },
      { status: 500 }
    );
  }
}