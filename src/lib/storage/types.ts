export type StorageProvider = 'local' | 'r2';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

export interface UploadOptions {
  folder?: string;
  convertToWebp?: boolean;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface StorageService {
  upload(
    file: Buffer,
    originalName: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<UploadResult>;
  delete(filename: string, folder?: string): Promise<boolean>;
  getUrl(filename: string, folder?: string): string;
}
