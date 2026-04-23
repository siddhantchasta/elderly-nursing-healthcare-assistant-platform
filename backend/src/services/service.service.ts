import Service from "@/models/Service";

export interface ServiceListItem {
  id: string;
  category: string;
  serviceName: string;
  description: string;
  duration: string;
  price: number;
  requiredQualification: string;
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