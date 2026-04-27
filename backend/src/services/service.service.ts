import Service, { SERVICE_CATEGORIES, ServiceCategory } from "@/models/Service";

export interface CreateServiceInput {
  category: ServiceCategory;
  serviceName: string;
  description: string;
  duration: string;
  price: number;
  requiredQualification: string;
}

export interface CreatedService {
  id: string;
  category: ServiceCategory;
  serviceName: string;
  description: string;
  duration: string;
  price: number;
  requiredQualification: string;
}

export interface UpdateServiceInput {
  serviceId: string;
  category?: ServiceCategory;
  serviceName?: string;
  description?: string;
  duration?: string;
  price?: number;
  requiredQualification?: string;
}

export interface UpdatedService {
  id: string;
  category: ServiceCategory;
  serviceName: string;
  description: string;
  duration: string;
  price: number;
  requiredQualification: string;
}

export interface ServiceListItem {
  id: string;
  category: string;
  serviceName: string;
  description: string;
  duration: string;
  price: number;
  requiredQualification: string;
}


export function isValidServiceCategory(category: string): category is ServiceCategory {
  return SERVICE_CATEGORIES.includes(category as ServiceCategory);
}

export async function listServices(): Promise<ServiceListItem[]> {
  const services = await Service.find({}).sort({ category: 1, serviceName: 1 }).lean();

  return services.map((service) => ({
    id: service._id.toString(),
    category: service.category,
    serviceName: service.serviceName,
    description: service.description,
    duration: service.duration,
    price: service.price,
    requiredQualification: service.requiredQualification,
  }));
}

export async function createService(input: CreateServiceInput): Promise<CreatedService> {
  const existingService = await Service.findOne({
    category: input.category,
    serviceName: input.serviceName,
  }).lean();

  if (existingService) {
    throw new Error("SERVICE_ALREADY_EXISTS");
  }

  const createdService = await Service.create({
    category: input.category,
    serviceName: input.serviceName,
    description: input.description,
    duration: input.duration,
    price: input.price,
    requiredQualification: input.requiredQualification,
  });

  return {
    id: createdService._id.toString(),
    category: createdService.category,
    serviceName: createdService.serviceName,
    description: createdService.description,
    duration: createdService.duration,
    price: createdService.price,
    requiredQualification: createdService.requiredQualification,
  };
}

export async function updateService(input: UpdateServiceInput): Promise<UpdatedService> {
  const service = await Service.findById(input.serviceId);

  if (!service) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  const targetCategory = input.category ?? service.category;
  const targetServiceName = input.serviceName ?? service.serviceName;

  const conflictingService = await Service.findOne({
    _id: { $ne: input.serviceId },
    category: targetCategory,
    serviceName: targetServiceName,
  }).lean();

  if (conflictingService) {
    throw new Error("SERVICE_ALREADY_EXISTS");
  }

  if (input.category !== undefined) {
    service.category = input.category;
  }

  if (input.serviceName !== undefined) {
    service.serviceName = input.serviceName;
  }

  if (input.description !== undefined) {
    service.description = input.description;
  }

  if (input.duration !== undefined) {
    service.duration = input.duration;
  }

  if (input.price !== undefined) {
    service.price = input.price;
  }

  if (input.requiredQualification !== undefined) {
    service.requiredQualification = input.requiredQualification;
  }

  await service.save();

  return {
    id: service._id.toString(),
    category: service.category,
    serviceName: service.serviceName,
    description: service.description,
    duration: service.duration,
    price: service.price,
    requiredQualification: service.requiredQualification,
  };
}

