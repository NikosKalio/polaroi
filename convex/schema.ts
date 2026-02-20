import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  canvases: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.string(),
    inviteCode: v.string(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"])
    .index("by_invite_code", ["inviteCode"]),

  photos: defineTable({
    canvasId: v.id("canvases"),
    displayName: v.string(),
    storageId: v.optional(v.id("_storage")),
    r2Key: v.optional(v.string()),
    timestamp: v.number(),
    posX: v.number(),
    posY: v.number(),
    rotation: v.number(),
  })
    .index("by_canvas", ["canvasId"])
    .index("by_canvas_user", ["canvasId", "displayName"]),
});
