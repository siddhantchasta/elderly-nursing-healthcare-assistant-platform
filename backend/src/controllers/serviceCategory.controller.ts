import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { isValidObjectId } from "@/services/booking.service";
import {
  createServiceCategory,
  deactivateServiceCategory,
  listServiceCategoriesForAdmin,
  updateServiceCategory,
} from "@/services/serviceCategory.service";

interface CreateServiceCategoryRequestBody {
  code?: string;
  name?: string;
}

interface UpdateServiceCategoryRequestBody {
  categoryId?: string;
  code?: string;
  name?: string;
  isActive?: boolean;
}

interface DeleteServiceCategoryRequestBody {
  categoryId?: string;
}

export async function listServiceCategoriesController(request: Request) {
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

  try {
    await connectToDatabase();

    const categories = await listServiceCategoriesForAdmin();

    return NextResponse.json(
      {
        success: true,
        message: "Service categories fetched successfully",
        data: categories,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch service categories",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function createServiceCategoryController(request: Request) {
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

  let body: CreateServiceCategoryRequestBody;

  try {
    body = (await request.json()) as CreateServiceCategoryRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const code = body.code?.trim().toLowerCase();
  const name = body.name?.trim();

  if (!code || !name) {
    return NextResponse.json(
      {
        success: false,
        message: "code and name are required",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const createdCategory = await createServiceCategory({
      code,
      name,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service category created successfully",
        data: createdCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "SERVICE_CATEGORY_ALREADY_EXISTS") {
      return NextResponse.json(
        {
          success: false,
          message: "SERVICE_CATEGORY_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create service category",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function updateServiceCategoryController(request: Request) {
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

  let body: UpdateServiceCategoryRequestBody;

  try {
    body = (await request.json()) as UpdateServiceCategoryRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const categoryId = body.categoryId?.trim();
  const code = body.code?.trim().toLowerCase();
  const name = body.name?.trim();
  const isActive = body.isActive;

  if (!categoryId) {
    return NextResponse.json(
      {
        success: false,
        message: "categoryId is required",
      },
      { status: 400 }
    );
  }

  if (!isValidObjectId(categoryId)) {
    return NextResponse.json(
      {
        success: false,
        message: "categoryId must be a valid ObjectId",
      },
      { status: 400 }
    );
  }

  if (code === undefined && name === undefined && isActive === undefined) {
    return NextResponse.json(
      {
        success: false,
        message: "At least one field is required: code, name, or isActive",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const updatedCategory = await updateServiceCategory({
      categoryId,
      code,
      name,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service category updated successfully",
        data: updatedCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SERVICE_CATEGORY_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "SERVICE_CATEGORY_NOT_FOUND",
          },
          { status: 404 }
        );
      }

      if (error.message === "SERVICE_CATEGORY_ALREADY_EXISTS") {
        return NextResponse.json(
          {
            success: false,
            message: "SERVICE_CATEGORY_ALREADY_EXISTS",
          },
          { status: 409 }
        );
      }
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update service category",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function deactivateServiceCategoryController(request: Request) {
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

  let body: DeleteServiceCategoryRequestBody;

  try {
    body = (await request.json()) as DeleteServiceCategoryRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const categoryId = body.categoryId?.trim();

  if (!categoryId) {
    return NextResponse.json(
      {
        success: false,
        message: "categoryId is required",
      },
      { status: 400 }
    );
  }

  if (!isValidObjectId(categoryId)) {
    return NextResponse.json(
      {
        success: false,
        message: "categoryId must be a valid ObjectId",
      },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const deactivatedCategory = await deactivateServiceCategory(categoryId);

    return NextResponse.json(
      {
        success: true,
        message: "Service category deactivated successfully",
        data: deactivatedCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SERVICE_CATEGORY_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "SERVICE_CATEGORY_NOT_FOUND",
          },
          { status: 404 }
        );
      }

    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate service category",
        error: message,
      },
      { status: 500 }
    );
  }
}
