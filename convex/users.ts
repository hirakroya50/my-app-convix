import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ── Helper: get authenticated user from ctx ──────────────────────

export async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  // Convex Auth stores users with the subject as ID reference
  const userId = identity.subject as Id<"users">;
  return await ctx.db.get(userId);
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getAuthUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireOwner(ctx: QueryCtx | MutationCtx) {
  const user = await requireAuth(ctx);
  if (user.role !== "owner") throw new Error("Unauthorized: owner access required");
  return user;
}

// ── Queries ──────────────────────────────────────────────────────

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthUser(ctx);
  },
});

// ── Mutations ────────────────────────────────────────────────────

// Set the first registered user as "owner", all others as "customer"
export const setInitialRole = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    // If user already has a role, don't overwrite
    if (user.role) return;

    // Check if any owner exists
    const existingOwner = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "owner"))
      .first();

    const role = existingOwner ? "customer" : "owner";
    await ctx.db.patch(args.userId, { role });
  },
});

// Owner can promote a customer to owner
export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("customer")),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    await ctx.db.patch(args.userId, { role: args.role });
  },
});
