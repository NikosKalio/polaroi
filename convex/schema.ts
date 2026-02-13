import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  photos: defineTable({
    userName: v.string(),
    storageId: v.id("_storage"),
    timestamp: v.number(),
    posX: v.number(),
    posY: v.number(),
    rotation: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
