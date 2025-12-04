import type { StorageProvider, StorageService, R2Config } from "./types";
import { LocalStorageService } from "./local";
import { R2StorageService } from "./r2";

export type { StorageProvider, StorageService, UploadResult, UploadOptions } from "./types";

/**
 * Get R2 configuration from environment variables
 */
export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
  };
}

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  return getR2Config() !== null;
}

/**
 * Get the default storage provider
 */
export function getDefaultStorageProvider(): StorageProvider {
  return isR2Configured() ? "r2" : "local";
}

/**
 * Get storage service based on provider type
 */
export function getStorageService(provider: StorageProvider): StorageService {
  if (provider === "r2") {
    const config = getR2Config();
    if (!config) {
      console.warn("R2 not configured, falling back to local storage");
      return new LocalStorageService();
    }
    return new R2StorageService(config);
  }

  return new LocalStorageService();
}
