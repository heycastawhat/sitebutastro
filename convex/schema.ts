import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  messages: defineTable({
    userId: v.optional(v.id("users")),
    author: v.optional(v.string()),
    body: v.string(),
    approved: v.optional(v.boolean()),
    siteUrl: v.optional(v.string()),
    buttonUrl: v.optional(v.string()),
  }),
  replies: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    body: v.string(),
    approved: v.optional(v.boolean()),
  }).index("by_message", ["messageId"]),
  links: defineTable({
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
  }),
});
