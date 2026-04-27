import ServiceCategory from "@/models/ServiceCategory";

export interface ServiceCategoryListItem {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceCategoryInput {
  code: string;
  name: string;
}

export interface UpdateServiceCategoryInput {
  categoryId: string;
  code?: string;
  name?: string;
  isActive?: boolean;
}

function toServiceCategoryListItem(category: {
  _id: unknown;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ServiceCategoryListItem {
  return {
    id: String(category._id),
    code: category.code,
    name: category.name,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function listServiceCategoriesForAdmin(): Promise<ServiceCategoryListItem[]> {
  const categories = await ServiceCategory.find({}).sort({ createdAt: -1 }).lean();
  return categories.map(toServiceCategoryListItem);
}

export async function createServiceCategory(
  input: CreateServiceCategoryInput
): Promise<ServiceCategoryListItem> {
  const existingCategory = await ServiceCategory.findOne({ code: input.code }).lean();

  if (existingCategory) {
    throw new Error("SERVICE_CATEGORY_ALREADY_EXISTS");
  }

  const createdCategory = await ServiceCategory.create({
    code: input.code,
    name: input.name,
    isActive: true,
  });

  return {
    id: createdCategory._id.toString(),
    code: createdCategory.code,
    name: createdCategory.name,
    isActive: createdCategory.isActive,
    createdAt: createdCategory.createdAt,
    updatedAt: createdCategory.updatedAt,
  };
}

export async function updateServiceCategory(
  input: UpdateServiceCategoryInput
): Promise<ServiceCategoryListItem> {
  const category = await ServiceCategory.findById(input.categoryId);

  if (!category) {
    throw new Error("SERVICE_CATEGORY_NOT_FOUND");
  }

  const targetCode = input.code ?? category.code;

  const conflictingCategory = await ServiceCategory.findOne({
    _id: { $ne: input.categoryId },
    code: targetCode,
  }).lean();

  if (conflictingCategory) {
    throw new Error("SERVICE_CATEGORY_ALREADY_EXISTS");
  }

  if (input.code !== undefined) {
    category.code = input.code;
  }

  if (input.name !== undefined) {
    category.name = input.name;
  }

  if (input.isActive !== undefined) {
    category.isActive = input.isActive;
  }

  await category.save();

  return {
    id: category._id.toString(),
    code: category.code,
    name: category.name,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function deactivateServiceCategory(categoryId: string): Promise<ServiceCategoryListItem> {
  const category = await ServiceCategory.findById(categoryId);

  if (!category) {
    throw new Error("SERVICE_CATEGORY_NOT_FOUND");
  }

  category.isActive = false;
  await category.save();

  return {
    id: category._id.toString(),
    code: category.code,
    name: category.name,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function assertActiveServiceCategoryExists(categoryCode: string): Promise<void> {
  const category = await ServiceCategory.findOne({
    code: categoryCode,
    isActive: true,
  })
    .select("_id")
    .lean();

  if (!category) {
    throw new Error("SERVICE_CATEGORY_NOT_FOUND_OR_INACTIVE");
  }
}
