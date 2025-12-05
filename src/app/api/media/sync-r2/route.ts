import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getR2Config, isR2Configured } from "@/lib/storage";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// POST /api/media/sync-r2 - Sync files from R2 bucket to Media table
export async function POST() {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "R2 is not configured" },
        { status: 400 }
      );
    }

    const config = getR2Config()!;
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    // List all files in R2 bucket
    const r2Files: Array<{
      key: string;
      size: number;
      lastModified?: Date;
    }> = [];

    let continuationToken: string | undefined;
    do {
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: config.bucketName,
          ContinuationToken: continuationToken,
        })
      );

      if (response.Contents) {
        for (const obj of response.Contents) {
          if (obj.Key && obj.Size) {
            r2Files.push({
              key: obj.Key,
              size: obj.Size,
              lastModified: obj.LastModified,
            });
          }
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // Get existing media URLs from database
    const existingMedia = await prisma.media.findMany({
      where: { storageProvider: "r2" },
      select: { url: true },
    });
    const existingUrls = new Set(existingMedia.map((m) => m.url));

    // Sync new files to database
    let synced = 0;
    let skipped = 0;

    for (const file of r2Files) {
      const url = `${config.publicUrl}/${file.key}`;
      
      // Skip if already exists
      if (existingUrls.has(url)) {
        skipped++;
        continue;
      }

      // Extract filename and folder from key
      const parts = file.key.split("/");
      const filename = parts.pop() || file.key;
      const folder = parts.join("/") || "uploads";

      // Determine mime type from extension
      const ext = filename.split(".").pop()?.toLowerCase() || "";
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
        txt: "text/plain",
      };
      const mimeType = mimeTypes[ext] || "application/octet-stream";

      // Create media record
      await prisma.media.create({
        data: {
          filename,
          originalName: filename,
          mimeType,
          size: file.size,
          url,
          folder,
          storageProvider: "r2",
          createdAt: file.lastModified || new Date(),
        },
      });
      synced++;
    }

    return NextResponse.json({
      success: true,
      totalInR2: r2Files.length,
      synced,
      skipped,
    });
  } catch (error) {
    console.error("R2 sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}

// GET /api/media/sync-r2 - Get R2 sync status
export async function GET() {
  try {
    if (!isR2Configured()) {
      return NextResponse.json({
        configured: false,
        error: "R2 is not configured",
      });
    }

    const config = getR2Config()!;
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    // Count files in R2
    let r2Count = 0;
    let continuationToken: string | undefined;
    do {
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: config.bucketName,
          ContinuationToken: continuationToken,
        })
      );
      r2Count += response.Contents?.length || 0;
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // Count R2 media in database
    const dbCount = await prisma.media.count({
      where: { storageProvider: "r2" },
    });

    return NextResponse.json({
      configured: true,
      r2Files: r2Count,
      dbRecords: dbCount,
      needsSync: r2Count > dbCount,
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      error: error instanceof Error ? error.message : "Failed to check status",
    });
  }
}
