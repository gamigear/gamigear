import "dotenv/config";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function listFiles() {
  const response = await client.send(new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME!,
    MaxKeys: 20,
  }));
  
  console.log("Files in R2 bucket:");
  if (response.Contents && response.Contents.length > 0) {
    response.Contents.forEach(obj => {
      console.log(`- ${obj.Key} (${obj.Size} bytes)`);
    });
    console.log(`\nTotal: ${response.Contents.length} files`);
    console.log(`\nPublic URL example: ${process.env.R2_PUBLIC_URL}/${response.Contents[0].Key}`);
  } else {
    console.log("No files found in bucket");
  }
}

listFiles().catch(err => console.error("Error:", err.message));
