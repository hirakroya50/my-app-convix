import { query } from "./_generated/server";

// Returns the coffee shop menu dynamically from the menu table
export const getMenu = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menu").collect();
    const available = items.filter(
      (item) => item.available && item.quantity > 0,
    );

    // Get shop name from settings
    const shopNameSetting = await ctx.db
      .query("shopSettings")
      .withIndex("by_key", (q) => q.eq("key", "shopName"))
      .unique();

    return {
      shopName: shopNameSetting?.value ?? "Brew Haven",
      items: available.map((item) => ({
        id: item._id,
        name: item.name,
        price: `$${item.price.toFixed(2)}`,
        priceNumber: item.price,
        description: item.description,
        category: item.category,
        available: item.quantity,
      })),
    };
  },
});

// Returns shop opening hours from settings
export const getTimings = query({
  args: {},
  handler: async (ctx) => {
    const weekday = await ctx.db
      .query("shopSettings")
      .withIndex("by_key", (q) => q.eq("key", "hours_weekday"))
      .unique();
    const weekend = await ctx.db
      .query("shopSettings")
      .withIndex("by_key", (q) => q.eq("key", "hours_weekend"))
      .unique();

    return {
      weekday: weekday?.value ?? "Mon – Fri: 6:00 AM – 11:00 PM",
      weekend: weekend?.value ?? "Sat – Sun: 7:00 AM – 12:00 AM",
      note: "Open every day of the week. Pickup orders available during all hours.",
    };
  },
});

// Returns available services from settings
export const getServices = query({
  args: {},
  handler: async (ctx) => {
    const servicesSetting = await ctx.db
      .query("shopSettings")
      .withIndex("by_key", (q) => q.eq("key", "services"))
      .unique();

    if (servicesSetting) {
      try {
        return { services: JSON.parse(servicesSetting.value) };
      } catch {
        // fallback
      }
    }

    return {
      services: [
        {
          name: "Free WiFi",
          description: "High-speed internet throughout the shop",
        },
        { name: "Takeaway", description: "Grab your favorite drink on the go" },
        {
          name: "Dine-in",
          description: "Cozy seating for a relaxed experience",
        },
        { name: "Pickup", description: "Order online, pick up at the counter" },
      ],
    };
  },
});
