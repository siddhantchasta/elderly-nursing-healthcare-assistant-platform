import {
  createServiceCategoryController,
  deactivateServiceCategoryController,
  listServiceCategoriesController,
  updateServiceCategoryController,
} from "@/controllers/serviceCategory.controller";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return listServiceCategoriesController(request);
}

export async function POST(request: Request) {
  return createServiceCategoryController(request);
}

export async function PATCH(request: Request) {
  return updateServiceCategoryController(request);
}

export async function DELETE(request: Request) {
  return deactivateServiceCategoryController(request);
}
