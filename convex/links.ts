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
    return await ctx.db.query("links").order("desc").collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { title, url, description, category }) => {
    const admin = await isAdmin(ctx);
    if (!admin) throw new Error("Unauthorized");
    await ctx.db.insert("links", { title, url, description, category });
  },
});

export const remove = mutation({
  args: { linkId: v.id("links") },
  handler: async (ctx, { linkId }) => {
    const admin = await isAdmin(ctx);
    if (!admin) throw new Error("Unauthorized");
    await ctx.db.delete(linkId);
  },
});

export const checkAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await isAdmin(ctx);
  },
});
