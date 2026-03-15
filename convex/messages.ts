import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent 50 messages
    return await ctx.db.query("messages").order("desc").take(50);
  },
});

export const send = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, { body, author }) => {
    // Insert a new message into the database
    await ctx.db.insert("messages", { body, author });
  },
});
