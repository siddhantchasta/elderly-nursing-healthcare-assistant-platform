import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const MEDICAL_DATA_ENCRYPTION_KEY = process.env.MEDICAL_DATA_ENCRYPTION_KEY;

if (!MEDICAL_DATA_ENCRYPTION_KEY) {
  throw new Error("Please define the MEDICAL_DATA_ENCRYPTION_KEY environment variable in .env.local");
}

const decodedKey = Buffer.from(MEDICAL_DATA_ENCRYPTION_KEY, "base64");

if (decodedKey.length !== 32) {
  throw new Error("MEDICAL_DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
}

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const VERSION_PREFIX = "v1";

export function encryptMedicalData(plainText: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, decodedKey, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${VERSION_PREFIX}:${iv.toString("base64")}:${encrypted.toString("base64")}:${authTag.toString("base64")}`;
}

export function decryptMedicalData(cipherText: string): string {
  if (!cipherText.startsWith(`${VERSION_PREFIX}:`)) {
    return cipherText;
  }

  const parts = cipherText.split(":");

  if (parts.length !== 4) {
    throw new Error("MEDICAL_DATA_DECRYPTION_FAILED");
  }

  const [, ivBase64, encryptedBase64, authTagBase64] = parts;
  const iv = Buffer.from(ivBase64, "base64");
  const encrypted = Buffer.from(encryptedBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");

  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, decodedKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
