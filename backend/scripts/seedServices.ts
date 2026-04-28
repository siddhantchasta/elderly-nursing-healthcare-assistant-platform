import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/mongodb";
import Service, { IService, ServiceCategory } from "../src/models/Service";

type SeedService = Pick<
  IService,
  "category" | "serviceName" | "description" | "duration" | "price" | "requiredQualification"
>;

const REQUIRED_SERVICES: SeedService[] = [
  {
    category: "nursing_care",
    serviceName: "Nursing Care",
    description: "Skilled nursing support for vitals monitoring, wound care, and routine medical assistance.",
    duration: "Daily",
    price: 1500,
    requiredQualification: "Registered Nurse",
  },
  {
    category: "elderly_attendant",
    serviceName: "Elderly Attendant",
    description: "Day-to-day personal care assistance including mobility support, hygiene, and companionship.",
    duration: "Hourly / Daily",
    price: 900,
    requiredQualification: "Certified Elderly Care Attendant",
  },
  {
    category: "physiotherapy",
    serviceName: "Physiotherapy",
    description: "At-home physiotherapy sessions focused on mobility recovery, pain management, and rehabilitation.",
    duration: "Per Session",
    price: 1200,
    requiredQualification: "Licensed Physiotherapist",
  },
  {
    category: "post_hospital_care",
    serviceName: "Post-Hospital Care",
    description: "Structured recovery support after hospital discharge, including medication and follow-up routines.",
    duration: "Short-term / Long-term",
    price: 1800,
    requiredQualification: "Trained Post-Operative Care Specialist",
  },
];

async function seedServices() {
  await connectToDatabase();

  let inserted = 0;
  let updated = 0;

  for (const service of REQUIRED_SERVICES) {
    const existing = await Service.findOne({
      category: service.category as ServiceCategory,
      serviceName: service.serviceName,
    });

    if (!existing) {
      await Service.create(service);
      inserted += 1;
      continue;
    }

    const needsUpdate =
      existing.description !== service.description ||
      existing.duration !== service.duration ||
      existing.price !== service.price ||
      existing.requiredQualification !== service.requiredQualification;

    if (needsUpdate) {
      existing.description = service.description;
      existing.duration = service.duration;
      existing.price = service.price;
      existing.requiredQualification = service.requiredQualification;
      await existing.save();
      updated += 1;
    }
  }

  console.log(
    `[seed:services] Done. inserted=${inserted}, updated=${updated}, total_required=${REQUIRED_SERVICES.length}`
  );
}

seedServices()
  .catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[seed:services] Failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
