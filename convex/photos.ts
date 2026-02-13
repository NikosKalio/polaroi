import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MAX_PHOTOS_PER_USER = 30;

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const savePhoto = mutation({
  args: {
    userName: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("photos")
      .filter((q) => q.eq(q.field("userName"), args.userName))
      .collect();

    if (existing.length >= MAX_PHOTOS_PER_USER) {
      throw new Error(
        `Photo limit reached! Each person can take up to ${MAX_PHOTOS_PER_USER} photos.`
      );
    }

    const posX = Math.random() * 80 + 5;
    const posY = Math.random() * 80 + 5;
    const rotation = Math.random() * 30 - 15;

    await ctx.db.insert("photos", {
      userName: args.userName,
      storageId: args.storageId,
      timestamp: Date.now(),
      posX,
      posY,
      rotation,
    });
  },
});

export const getPhotos = query({
  handler: async (ctx) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();

    return await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        url: await ctx.storage.getUrl(photo.storageId),
      }))
    );
  },
});

export const getPhotoCount = query({
  args: { userName: v.string() },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .filter((q) => q.eq(q.field("userName"), args.userName))
      .collect();
    return photos.length;
  },
});
