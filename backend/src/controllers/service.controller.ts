import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { listServices } from "@/services/service.service";

export async function listServicesController() {
  try {
    await connectToDatabase();

    const services = await listServices();

    return NextResponse.json(
      {
        success: true,
        message: "Services fetched successfully",
        data: services,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch services",
        error: message,
      },
      { status: 500 }
    );
  }
}