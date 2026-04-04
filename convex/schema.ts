import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Users with role-based access
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneNumberVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("owner"), v.literal("customer"))),
  })
    .index("email", ["email"])
    .index("by_role", ["role"]),

  // Chat messages scoped to a user
  messages: defineTable({
    userId: v.optional(v.id("users")),
    text: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_userId_timestamp", ["userId", "timestamp"]),

  // Dynamic menu items managed by admin
  menu: defineTable({
    name: v.string(),
    price: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
    available: v.boolean(),
    quantity: v.number(),
    imageEmoji: v.optional(v.string()),
  }).index("by_category", ["category"]),

  // Orders placed via chat — optionally scoped to customer
  orders: defineTable({
    userId: v.optional(v.id("users")),
    items: v.array(
      v.object({
        menuItemId: v.id("menu"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
    totalPrice: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("picked_up"),
      v.literal("cancelled"),
    ),
    pickupName: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_userId_timestamp", ["userId", "timestamp"])
    .index("by_status", ["status"]),

  // Shop settings (hours, services, etc.) — editable by owner
  shopSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
