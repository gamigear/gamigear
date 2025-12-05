import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const UPLOADS_DIR = path.join(process.cwd(), "public/uploads");

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

async function syncUploadsToMedia() {
  console.log("🔄 Starting sync from public/uploads to Media...\n");

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log("❌ Directory public/uploads does not exist");
    return;
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  const imageFiles = files.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);
  });

  console.log(`📁 Found ${imageFiles.length} image files\n`);

  let created = 0;
  let skipped = 0;

  for (const filename of imageFiles) {
    const filePath = path.join(UPLOADS_DIR, filename);
    const stats = fs.statSync(filePath);
    const url = `/uploads/${filename}`;

    // Check if already exists
    const existing = await prisma.media.findFirst({
      where: { url },
    });

    if (existing) {
      console.log(`⏭️  Skipped (exists): ${filename}`);
      skipped++;
      continue;
    }

    // Create media record
    await prisma.media.create({
      data: {
        filename,
        originalName: filename,
        mimeType: getMimeType(filename),
        size: stats.size,
        url,
        folder: "uploads",
        storageProvider: "local",
      },
    });

    console.log(`✅ Created: ${filename}`);
    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${imageFiles.length}`);
}

syncUploadsToMedia()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
