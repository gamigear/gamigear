import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import path from "path";
import sharp from "sharp";
import type {
  StorageService,
  UploadResult,
  UploadOptions,
  R2Config,
} from "./types";

export class R2StorageService implements StorageService {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(config: R2Config) {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  async upload(
    file: Buffer,
    originalName: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const { folder = "uploads", convertToWebp = true } = options;

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

    // Upload to R2
    const key = folder ? `${folder}/${filename}` : filename;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: finalMimeType,
      })
    );

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
      url: `${this.publicUrl}/${key}`,
      filename,
      size: finalSize,
      mimeType: finalMimeType,
      width,
      height,
    };
  }

  async delete(filename: string, folder: string = "uploads"): Promise<boolean> {
    try {
      const key = folder ? `${folder}/${filename}` : filename;

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );

      return true;
    } catch (error) {
      console.error("Failed to delete R2 file:", error);
      return false;
    }
  }

  getUrl(filename: string, folder: string = "uploads"): string {
    const key = folder ? `${folder}/${filename}` : filename;
    return `${this.publicUrl}/${key}`;
  }

  async listFiles(prefix: string = ""): Promise<R2FileInfo[]> {
    const files: R2FileInfo[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      );

      if (response.Contents) {
        for (const obj of response.Contents) {
          if (obj.Key && obj.Size) {
            const filename = obj.Key.split("/").pop() || obj.Key;
            const folder = obj.Key.includes("/")
              ? obj.Key.substring(0, obj.Key.lastIndexOf("/"))
              : "";

            files.push({
              key: obj.Key,
              filename,
              folder,
              size: obj.Size,
              lastModified: obj.LastModified,
              url: `${this.publicUrl}/${obj.Key}`,
            });
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return files;
  }

  async getFileInfo(key: string): Promise<R2FileInfo | null> {
    try {
      const response = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );

      const filename = key.split("/").pop() || key;
      const folder = key.includes("/")
        ? key.substring(0, key.lastIndexOf("/"))
        : "";

      return {
        key,
        filename,
        folder,
        size: response.ContentLength || 0,
        mimeType: response.ContentType,
        lastModified: response.LastModified,
        url: `${this.publicUrl}/${key}`,
      };
    } catch {
      return null;
    }
  }
}

export interface R2FileInfo {
  key: string;
  filename: string;
  folder: string;
  size: number;
  mimeType?: string;
  lastModified?: Date;
  url: string;
}
