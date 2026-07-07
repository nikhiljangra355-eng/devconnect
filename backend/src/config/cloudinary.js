import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !process.env.CLOUDINARY_CLOUD_NAME.startsWith("your_") &&
      !process.env.CLOUDINARY_API_KEY.startsWith("your_") &&
      !process.env.CLOUDINARY_API_SECRET.startsWith("your_")
  );

const saveBufferLocally = async (buffer, mimetype = "image/png") => {
  await fs.mkdir(uploadsDir, { recursive: true });
  const extension = mimetype.split("/")[1]?.replace("jpeg", "jpg") || "png";
  const filename = `${crypto.randomUUID()}.${extension}`;
  const filepath = path.join(uploadsDir, filename);

  await fs.writeFile(filepath, buffer);

  return {
    secure_url: `${process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`}/uploads/${filename}`,
    public_id: `local/${filename}`
  };
};

export const uploadBufferToCloudinary = (buffer, folder = "devconnect", mimetype = "image/png") => {
  if (!hasCloudinaryConfig()) {
    return saveBufferLocally(buffer, mimetype);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export default cloudinary;
