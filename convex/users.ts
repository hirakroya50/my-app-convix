import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type AuthCtx = QueryCtx | MutationCtx;

async function assignRoleIfMissing(
  ctx: MutationCtx,
  user: Doc<"users"> | null,
): Promise<Doc<"users"> | null> {
  if (!user || user.role) {
    return user;
  }

  const existingOwner = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "owner"))
    .first();

  const role = existingOwner ? "customer" : "owner";
  await ctx.db.patch(user._id, { role });

  return { ...user, role };
}

export async function getAuthUser(ctx: AuthCtx) {
  try {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const normalizedUserId = await ctx.db.normalizeId("users", String(userId));
    if (!normalizedUserId) {
      return null;
    }

    return await ctx.db.get(normalizedUserId);
  } catch (error) {
    console.warn("[auth] Failed to resolve authenticated user", error);
    return null;
  }
}

export async function requireAuth(ctx: AuthCtx) {
  const user = await getAuthUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireOwner(ctx: AuthCtx) {
  const user = await requireAuth(ctx);
  if (user.role !== "owner")
    throw new Error("Unauthorized: owner access required");
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
    await assignRoleIfMissing(ctx, user);
  },
});

export const ensureCurrentUserRole = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    const updatedUser = await assignRoleIfMissing(ctx, user);
    if (!updatedUser?.role) {
      throw new Error("Unable to assign user role");
    }
    return updatedUser.role;
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
