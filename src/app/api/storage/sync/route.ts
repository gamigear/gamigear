import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getR2Config } from "@/lib/storage";
import { R2StorageService } from "@/lib/storage/r2";

interface MediaRecord {
  url: string;
  filename: string;
}

// GET /api/storage/sync - List files in R2 that are not in database
export async function GET() {
  try {
    const config = getR2Config();
    if (!config) {
      return NextResponse.json(
        { error: "R2 not configured" },
        { status: 400 }
      );
    }

    const r2Service = new R2StorageService(config);
    const r2Files = await r2Service.listFiles();

    // Get existing media URLs from database (use raw query to avoid type issues)
    const existingMedia = await prisma.$queryRaw<MediaRecord[]>`
      SELECT url, filename FROM Media WHERE storageProvider = 'r2'
    `;

    const existingUrls = new Set(existingMedia.map((m: MediaRecord) => m.url));
    const existingFilenames = new Set(existingMedia.map((m: MediaRecord) => m.filename));

    // Filter files not in database
    const newFiles = r2Files.filter(
      (f) => !existingUrls.has(f.url) && !existingFilenames.has(f.filename)
    );

    return NextResponse.json({
      total: r2Files.length,
      existing: existingMedia.length,
      new: newFiles.length,
      files: newFiles,
    });
  } catch (error) {
    console.error("Error listing R2 files:", error);
    return NextResponse.json(
      { error: "Failed to list R2 files" },
      { status: 500 }
    );
  }
}

// POST /api/storage/sync - Import R2 files to database
export async function POST() {
  try {
    const config = getR2Config();
    if (!config) {
      return NextResponse.json(
        { error: "R2 not configured" },
        { status: 400 }
      );
    }

    const r2Service = new R2StorageService(config);
    const r2Files = await r2Service.listFiles();

    // Get existing media URLs from database
    const existingMedia = await prisma.$queryRaw<MediaRecord[]>`
      SELECT url, filename FROM Media WHERE storageProvider = 'r2'
    `;

    const existingUrls = new Set(existingMedia.map((m: MediaRecord) => m.url));
    const existingFilenames = new Set(existingMedia.map((m: MediaRecord) => m.filename));

    // Filter files not in database
    const newFiles = r2Files.filter(
      (f) => !existingUrls.has(f.url) && !existingFilenames.has(f.filename)
    );

    // Import new files
    const imported: string[] = [];
    const failed: string[] = [];

    for (const file of newFiles) {
      try {
        // Get detailed file info including mime type
        const fileInfo = await r2Service.getFileInfo(file.key);
        const mimeType = fileInfo?.mimeType || getMimeType(file.filename);

        await prisma.$executeRaw`
          INSERT INTO Media (id, filename, originalName, mimeType, size, url, folder, storageProvider, alt, title, createdAt, updatedAt)
          VALUES (${crypto.randomUUID()}, ${file.filename}, ${file.filename}, ${mimeType}, ${file.size}, ${file.url}, ${file.folder || "uploads"}, 'r2', ${file.filename}, ${file.filename}, datetime('now'), datetime('now'))
        `;

        imported.push(file.filename);
      } catch (err) {
        console.error(`Failed to import ${file.filename}:`, err);
        failed.push(file.filename);
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      failed: failed.length,
      importedFiles: imported,
      failedFiles: failed,
    });
  } catch (error) {
    console.error("Error syncing R2 files:", error);
    return NextResponse.json(
      { error: "Failed to sync R2 files" },
      { status: 500 }
    );
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}
