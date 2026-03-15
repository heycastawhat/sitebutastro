import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent 50 messages
    const messages = await ctx.db.query("messages").order("desc").take(50);

    return Promise.all(
      messages.map(async (message) => {
        if (message.userId) {
          const user = await ctx.db.get(message.userId);
          return { ...message, author: user?.name ?? "Anonymous" };
        }
        return message;
      }),
    );
  },
});

export const send = mutation({
  args: { body: v.string(), author: v.optional(v.string()) },
  handler: async (ctx, { body, author }) => {
    const userId = await getAuthUserId(ctx);
    // Insert a new message into the database
    await ctx.db.insert("messages", {
      body,
      author,
      userId: userId ?? undefined,
    });
  },
});
