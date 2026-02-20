import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const MAX_PHOTOS_PER_USER = 30;

export const savePhoto = mutation({
  args: {
    canvasId: v.id("canvases"),
    displayName: v.string(),
    storageId: v.optional(v.id("_storage")),
    r2Key: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.storageId && !args.r2Key) {
      throw new Error("Either storageId or r2Key is required");
    }

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
      r2Key: args.r2Key,
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

    const r2PublicUrl = process.env.R2_PUBLIC_URL;

    return await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        url: photo.r2Key
          ? `${r2PublicUrl}/${photo.r2Key}`
          : photo.storageId
            ? await ctx.storage.getUrl(photo.storageId!)
            : null,
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
    const photo = await ctx.db.get(args.id);
    if (!photo) throw new Error("Photo not found");

    // Only canvas owner can move photos
    const canvas = await ctx.db.get(photo.canvasId);
    if (!canvas) throw new Error("Canvas not found");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || canvas.ownerId !== identity.tokenIdentifier) {
      throw new Error("Only the canvas owner can rearrange photos");
    }

    await ctx.db.patch(args.id, { posX: args.posX, posY: args.posY });
  },
});

export const deletePhoto = mutation({
  args: { id: v.id("photos") },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.id);
    if (!photo) return;

    // Only canvas owner can delete photos
    const canvas = await ctx.db.get(photo.canvasId);
    if (!canvas) throw new Error("Canvas not found");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || canvas.ownerId !== identity.tokenIdentifier) {
      throw new Error("Only the canvas owner can delete photos");
    }

    if (photo.r2Key) {
      await ctx.scheduler.runAfter(0, internal.r2.deleteR2Object, {
        key: photo.r2Key,
      });
    } else if (photo.storageId) {
      await ctx.storage.delete(photo.storageId!);
    }
    await ctx.db.delete(args.id);
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
