import mongoose from "mongoose";
import User from "../src/models/User";
import { hashPassword } from "../src/lib/auth";
import { connectToDatabase } from "../src/lib/mongodb";

function getRequiredEnv(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD"): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required. Please set it in your environment before running seed:admin.`);
  }

  return value;
}

async function seedAdmin() {
  const adminEmail = getRequiredEnv("ADMIN_EMAIL").toLowerCase();
  const adminPassword = getRequiredEnv("ADMIN_PASSWORD");

  await connectToDatabase();

  const existingAdmin = await User.findOne({ role: "admin" }).lean();

  if (existingAdmin) {
    console.log(`[seed:admin] Admin already exists (${existingAdmin.email}). No action needed.`);
    return;
  }

  const existingEmail = await User.findOne({ email: adminEmail }).lean();

  if (existingEmail) {
    throw new Error(
      `[seed:admin] User with email ${adminEmail} already exists as role=${existingEmail.role}. ` +
        "No admin was created to avoid unintended role escalation."
    );
  }

  const passwordHash = await hashPassword(adminPassword);

  const createdAdmin = await User.create({
    email: adminEmail,
    passwordHash,
    role: "admin",
  });

  console.log(`[seed:admin] Admin created successfully: ${createdAdmin.email} (${createdAdmin._id.toString()})`);
}

seedAdmin()
  .catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[seed:admin] Failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
