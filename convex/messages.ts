import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const ADMIN_GITHUB_ID = "194756845";

async function isAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const accounts = await ctx.db
    .query("authAccounts")
    .filter((q: any) =>
      q.and(
        q.eq(q.field("userId"), userId),
        q.eq(q.field("provider"), "github"),
        q.eq(q.field("providerAccountId"), ADMIN_GITHUB_ID),
      ),
    )
    .collect();
  return accounts.length > 0;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("desc").take(50);

    const approved = messages.filter((m) => m.approved === true);

    return Promise.all(
      approved.map(async (message) => {
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
    await ctx.db.insert("messages", {
      body,
      author,
      userId: userId ?? undefined,
      approved: false,
    });
  },
});

// Admin-only: list all messages (pending + approved + rejected)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const admin = await isAdmin(ctx);
    if (!admin) return null;

    const messages = await ctx.db.query("messages").order("desc").take(100);

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

// Admin-only: check if current user is admin
export const checkAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await isAdmin(ctx);
  },
});

// Admin-only: approve a message
export const approve = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const admin = await isAdmin(ctx);
    if (!admin) throw new Error("Unauthorized");
    await ctx.db.patch(messageId, { approved: true });
  },
});

// Admin-only: delete a message (reject)
export const remove = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const admin = await isAdmin(ctx);
    if (!admin) throw new Error("Unauthorized");
    await ctx.db.delete(messageId);
  },
});
