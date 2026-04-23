import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { isValidObjectId } from "@/services/booking.service";
import {
  createService,
  isValidServiceCategory,
  listServices,
  updateService,
} from "@/services/service.service";

interface CreateServiceRequestBody {
  category?: string;
  serviceName?: string;
  description?: string;
  duration?: string;
  price?: number;
  requiredQualification?: string;
}

interface UpdateServiceRequestBody {
  serviceId?: string;
  category?: string;
  serviceName?: string;
  description?: string;
  duration?: string;
  price?: number;
  requiredQualification?: string;
}

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

export async function createServiceController(request: Request) {
  const authResult = authenticateRequest(request, ["admin"]);

  if (authResult.response) {
    return authResult.response;
  }

  if (!authResult.auth) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  let body: CreateServiceRequestBody;

  try {
    body = (await request.json()) as CreateServiceRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const category = body.category?.trim();
  const serviceName = body.serviceName?.trim();
  const description = body.description?.trim();
  const duration = body.duration?.trim();
  const requiredQualification = body.requiredQualification?.trim();
  const price = body.price;

  if (!category || !serviceName || !description || !duration || !requiredQualification || price === undefined) {
    return NextResponse.json(
      {
        success: false,
        message:
          "category, serviceName, description, duration, price, and requiredQualification are required",
      },
      { status: 400 }
    );
  }

  if (!isValidServiceCategory(category)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid category. Allowed values: nursing_care, elderly_attendant, physiotherapy, post_hospital_care",
      },
      { status: 400 }
    );
  }

  if (typeof price !== "number" || price < 0) {
    return NextResponse.json(
      {
        success: false,
        message: "price must be a non-negative number",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const createdService = await createService({
      category,
      serviceName,
      description,
      duration,
      price,
      requiredQualification,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        data: createdService,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create service",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function updateServiceController(request: Request) {
  const authResult = authenticateRequest(request, ["admin"]);

  if (authResult.response) {
    return authResult.response;
  }

  if (!authResult.auth) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  let body: UpdateServiceRequestBody;

  try {
    body = (await request.json()) as UpdateServiceRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const serviceId = body.serviceId?.trim();
  const category = body.category?.trim();
  const serviceName = body.serviceName?.trim();
  const description = body.description?.trim();
  const duration = body.duration?.trim();
  const requiredQualification = body.requiredQualification?.trim();
  const price = body.price;

  if (!serviceId) {
    return NextResponse.json(
      {
        success: false,
        message: "serviceId is required",
      },
      { status: 400 }
    );
  }

  if (!isValidObjectId(serviceId)) {
    return NextResponse.json(
      {
        success: false,
        message: "serviceId must be a valid ObjectId",
      },
      { status: 400 }
    );
  }

  if (
    category === undefined &&
    serviceName === undefined &&
    description === undefined &&
    duration === undefined &&
    requiredQualification === undefined &&
    price === undefined
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "At least one updatable field is required",
      },
      { status: 400 }
    );
  }

  if (category !== undefined && !isValidServiceCategory(category)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid category. Allowed values: nursing_care, elderly_attendant, physiotherapy, post_hospital_care",
      },
      { status: 400 }
    );
  }

  if (price !== undefined && (typeof price !== "number" || price < 0)) {
    return NextResponse.json(
      {
        success: false,
        message: "price must be a non-negative number",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const updatedService = await updateService({
      serviceId,
      category,
      serviceName,
      description,
      duration,
      price,
      requiredQualification,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service updated successfully",
        data: updatedService,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "SERVICE_NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          message: "SERVICE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update service",
        error: message,
      },
      { status: 500 }
    );
  }
}