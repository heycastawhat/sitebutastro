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

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const account = await ctx.db
      .query("authAccounts")
      .filter((q: any) => q.eq(q.field("userId"), userId))
      .first();
    return {
      name: user.name ?? "Anonymous",
      provider: account?.provider ?? "unknown",
    };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("desc").take(200);

    // Only show approved messages to public
    const approved = messages.filter((m) => m.approved === true);

    return Promise.all(
      approved.slice(0, 50).map(async (message) => {
        if (message.userId) {
          const user = await ctx.db.get(message.userId);
          return { ...message, author: user?.name ?? "Anonymous" };
        }
        return message;
      }),
    );
  },
});

// Admin-only: list pending (unapproved) messages
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const admin = await isAdmin(ctx);
    if (!admin) return [];
    const messages = await ctx.db.query("messages").order("desc").take(200);
    const pending = messages.filter((m) => m.approved !== true);
    return Promise.all(
      pending.map(async (message) => {
        if (message.userId) {
          const user = await ctx.db.get(message.userId);
          return { ...message, author: user?.name ?? "Anonymous" };
        }
        return message;
      }),
    );
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

function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid URL protocol");
    }
    return parsed.href;
  } catch {
    throw new Error("Invalid URL: must be a valid http or https URL");
  }
}

const RATE_LIMIT_MS = 60_000; // 1 message per minute

export const send = mutation({
  args: {
    body: v.string(),
    author: v.optional(v.string()),
    siteUrl: v.optional(v.string()),
    buttonUrl: v.optional(v.string()),
  },
  handler: async (ctx, { body, author, siteUrl, buttonUrl }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in to send a message");
    if (body.length > 1000) throw new Error("Message too long (max 1000 chars)");

    // Rate limit: check for recent messages from this user
    const recentMessages = await ctx.db
      .query("messages")
      .filter((q: any) => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(1);
    if (recentMessages.length > 0) {
      const elapsed = Date.now() - recentMessages[0]._creationTime;
      if (elapsed < RATE_LIMIT_MS) {
        const wait = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
        throw new Error(`Slow down! Please wait ${wait} seconds before sending another message.`);
      }
    }

    const cleanSiteUrl = sanitizeUrl(siteUrl);
    const cleanButtonUrl = sanitizeUrl(buttonUrl);

    // Admin messages are auto-approved
    const admin = await isAdmin(ctx);
    await ctx.db.insert("messages", {
      body,
      author,
      userId,
      siteUrl: cleanSiteUrl,
      buttonUrl: cleanButtonUrl,
      approved: admin ? true : false,
    });
  },
});

// Admin-only: check if current user is admin
export const checkAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await isAdmin(ctx);
  },
});

// Admin-only: delete a message
export const remove = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const admin = await isAdmin(ctx);
    if (!admin) throw new Error("Unauthorized");
    await ctx.db.delete(messageId);
  },
});
