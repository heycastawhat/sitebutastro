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

export const send = mutation({
  args: {
    body: v.string(),
    author: v.optional(v.string()),
    siteUrl: v.optional(v.string()),
    buttonUrl: v.optional(v.string()),
  },
  handler: async (ctx, { body, author, siteUrl, buttonUrl }) => {
    const userId = await getAuthUserId(ctx);
    if (body.length > 1000) throw new Error("Message too long (max 1000 chars)");
    const cleanSiteUrl = sanitizeUrl(siteUrl);
    const cleanButtonUrl = sanitizeUrl(buttonUrl);
    await ctx.db.insert("messages", {
      body,
      author,
      userId: userId ?? undefined,
      siteUrl: cleanSiteUrl,
      buttonUrl: cleanButtonUrl,
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
