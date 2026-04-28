export interface ServiceItem {
  id: string;
  category: "nursing_care" | "elderly_attendant" | "physiotherapy" | "post_hospital_care";
  serviceName: string;
  description: string;
  duration: string;
  price: number;
  requiredQualification: string;
}
