import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { nanoid } from "nanoid";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  const suffix = nanoid(4);
  return `${base}-${suffix}`;
}

export const createCanvas = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const slug = generateSlug(args.name);
    const inviteCode = nanoid(8);

    const id = await ctx.db.insert("canvases", {
      name: args.name,
      slug,
      ownerId: identity.tokenIdentifier,
      inviteCode,
      createdAt: Date.now(),
    });

    return { id, slug, inviteCode };
  },
});

export const getMyCanvases = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("canvases")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.tokenIdentifier))
      .order("desc")
      .collect();
  },
});

export const getCanvasBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("canvases")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getCanvasByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("canvases")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();
  },
});

export const deleteCanvas = mutation({
  args: { id: v.id("canvases") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const canvas = await ctx.db.get(args.id);
    if (!canvas) throw new Error("Canvas not found");
    if (canvas.ownerId !== identity.tokenIdentifier) {
      throw new Error("Not authorized");
    }

    // Delete all photos in this canvas
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.id))
      .collect();

    const r2Keys: string[] = [];
    for (const photo of photos) {
      if (photo.r2Key) {
        r2Keys.push(photo.r2Key);
      } else if (photo.storageId) {
        await ctx.storage.delete(photo.storageId!);
      }
      await ctx.db.delete(photo._id);
    }

    if (r2Keys.length > 0) {
      await ctx.scheduler.runAfter(0, internal.r2.deleteR2Objects, {
        keys: r2Keys,
      });
    }

    await ctx.db.delete(args.id);
  },
});

export const getCanvasPhotoCount = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();
    return photos.length;
  },
});
