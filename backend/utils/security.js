import crypto from "crypto";
import dotenv from 'dotenv';
dotenv.config();

const key = Buffer.alloc(32);
Buffer.from(process.env.ERP_SECRET).copy(key);

// Encryption function
export const encryptValue = (data) => {
  const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
  const text = randomCode + data;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return Buffer.from(`${encrypted}::${iv.toString("hex")}`).toString("base64");
}

// Decryption function
export const decryptValue = (data) => {
  const decoded = Buffer.from(data, "base64").toString();
  const [encryptedData, ivHex] = decoded.split("::");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted.slice(6);
}

