"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

export const generateR2UploadUrl = action({
  args: { canvasId: v.id("canvases") },
  handler: async (_ctx, args) => {
    const client = getR2Client();
    const key = `${args.canvasId}/${nanoid()}.jpg`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: "image/jpeg",
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
    return { uploadUrl, key };
  },
});

export const deleteR2Object = internalAction({
  args: { key: v.string() },
  handler: async (_ctx, args) => {
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: args.key,
      })
    );
  },
});

export const deleteR2Objects = internalAction({
  args: { keys: v.array(v.string()) },
  handler: async (_ctx, args) => {
    if (args.keys.length === 0) return;
    const client = getR2Client();
    await client.send(
      new DeleteObjectsCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Delete: {
          Objects: args.keys.map((key) => ({ Key: key })),
        },
      })
    );
  },
});
