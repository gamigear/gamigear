import "dotenv/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const config = {
  accountId: process.env.R2_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucketName: process.env.R2_BUCKET_NAME!,
  publicUrl: process.env.R2_PUBLIC_URL!,
};

console.log("R2 Config:", {
  accountId: config.accountId,
  bucketName: config.bucketName,
  publicUrl: config.publicUrl,
  hasAccessKey: !!config.accessKeyId,
  hasSecretKey: !!config.secretAccessKey,
});

const client = new S3Client({
  region: "auto",
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

async function testUpload() {
  try {
    // Test upload
    const testContent = Buffer.from("Hello R2 Test!");
    const key = `test/test-${Date.now()}.txt`;

    console.log(`\nUploading to bucket: ${config.bucketName}, key: ${key}`);

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: testContent,
        ContentType: "text/plain",
      })
    );

    console.log("✅ Upload successful!");
    console.log(`URL: ${config.publicUrl}/${key}`);
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
}

testUpload();
