import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MAX_PHOTOS_PER_USER = 30;

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const savePhoto = mutation({
  args: {
    canvasId: v.id("canvases"),
    displayName: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Validate canvas exists
    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) throw new Error("Canvas not found");

    const existing = await ctx.db
      .query("photos")
      .withIndex("by_canvas_user", (q) =>
        q.eq("canvasId", args.canvasId).eq("displayName", args.displayName)
      )
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
      canvasId: args.canvasId,
      displayName: args.displayName,
      storageId: args.storageId,
      timestamp: Date.now(),
      posX,
      posY,
      rotation,
    });
  },
});

export const getPhotos = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    return await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        url: await ctx.storage.getUrl(photo.storageId),
      }))
    );
  },
});

export const movePhoto = mutation({
  args: {
    id: v.id("photos"),
    posX: v.number(),
    posY: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { posX: args.posX, posY: args.posY });
  },
});

export const deletePhoto = mutation({
  args: { id: v.id("photos") },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.id);
    if (photo) {
      await ctx.storage.delete(photo.storageId);
      await ctx.db.delete(args.id);
    }
  },
});

export const getPhotoCount = query({
  args: {
    canvasId: v.id("canvases"),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_canvas_user", (q) =>
        q.eq("canvasId", args.canvasId).eq("displayName", args.displayName)
      )
      .collect();
    return photos.length;
  },
});
