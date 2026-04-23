import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { listAvailableCaregivers } from "@/services/caregiver.service";

export async function listCaregiversController() {
  try {
    await connectToDatabase();

    const caregivers = await listAvailableCaregivers();

    return NextResponse.json(
      {
        success: true,
        message: "Caregivers fetched successfully",
        data: caregivers,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch caregivers",
        error: message,
      },
      { status: 500 }
    );
  }
}