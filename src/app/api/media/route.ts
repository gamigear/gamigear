import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getStorageService,
  getDefaultStorageProvider,
  isR2Configured,
  type StorageProvider,
} from "@/lib/storage";

// GET /api/media - Get all media files
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get("folder");
    const mimeType = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "20");

    const where: Record<string, unknown> = {};

    if (folder) {
      where.folder = folder;
    }
    if (mimeType) {
      where.mimeType = { startsWith: mimeType };
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.media.count({ where }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return NextResponse.json({
      data: media,
      meta: { total, page, perPage, totalPages },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST /api/media - Upload new media
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";
    const alt = formData.get("alt") as string;
    const title = formData.get("title") as string;
    const convertToWebp = formData.get("convertToWebp") !== "false";
    
    // Get storage provider from form data or use default
    let storageProvider = formData.get("storageProvider") as StorageProvider | null;
    if (!storageProvider || (storageProvider === "r2" && !isR2Configured())) {
      storageProvider = getDefaultStorageProvider();
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get storage service and upload
    const storageService = getStorageService(storageProvider);
    const result = await storageService.upload(buffer, file.name, file.type, {
      folder,
      convertToWebp,
    });

    // Create media record in database
    const media = await prisma.media.create({
      data: {
        filename: result.filename,
        originalName: file.name,
        mimeType: result.mimeType,
        size: result.size,
        url: result.url,
        alt: alt || file.name,
        title: title || file.name,
        folder,
        width: result.width,
        height: result.height,
        storageProvider,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
