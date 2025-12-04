import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { StorageService, UploadResult, UploadOptions } from "./types";

export class LocalStorageService implements StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public");
  }

  async upload(
    file: Buffer,
    originalName: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const { folder = "uploads", convertToWebp = true } = options;

    // Create upload directory
    const uploadDir = path.join(this.baseDir, folder);
    await mkdir(uploadDir, { recursive: true });

    // Generate filename with timestamp
    const timestamp = Date.now();
    const originalExt = path.extname(originalName);
    const baseName = path
      .basename(originalName, originalExt)
      .replace(/[^a-zA-Z0-9.-]/g, "_");

    // Check if we should convert to WebP
    const shouldConvert =
      convertToWebp &&
      (mimeType === "image/jpeg" || mimeType === "image/png");

    let buffer = file;
    let filename: string;
    let finalMimeType: string;
    let finalSize: number;

    if (shouldConvert) {
      const isPng = mimeType === "image/png";
      const webpBuffer = await sharp(file)
        .webp({
          quality: 100,
          lossless: isPng,
        })
        .toBuffer();

      buffer = webpBuffer;
      filename = `${timestamp}-${baseName}.webp`;
      finalMimeType = "image/webp";
      finalSize = webpBuffer.length;
    } else {
      const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
      filename = `${timestamp}-${safeName}`;
      finalMimeType = mimeType;
      finalSize = file.length;
    }

    // Save file
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, new Uint8Array(buffer));

    // Get image dimensions
    let width: number | undefined;
    let height: number | undefined;

    if (finalMimeType.startsWith("image/") && finalMimeType !== "image/svg+xml") {
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch {
        // Ignore metadata errors
      }
    }

    return {
      url: `/${folder}/${filename}`,
      filename,
      size: finalSize,
      mimeType: finalMimeType,
      width,
      height,
    };
  }

  async delete(filename: string, folder: string = "uploads"): Promise<boolean> {
    try {
      const filepath = path.join(this.baseDir, folder, filename);
      await unlink(filepath);
      return true;
    } catch (error) {
      console.error("Failed to delete local file:", error);
      return false;
    }
  }

  getUrl(filename: string, folder: string = "uploads"): string {
    return `/${folder}/${filename}`;
  }
}
