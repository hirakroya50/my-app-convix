import { query } from "./_generated/server";

// Returns the coffee shop menu dynamically from the menu table
export const getMenu = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menu").collect();
    const available = items.filter((item) => item.available && item.quantity > 0);
    return {
      shopName: "Brew Haven",
      items: available.map((item) => ({
        id: item._id,
        name: item.name,
        price: `$${item.price.toFixed(2)}`,
        priceNumber: item.price,
        description: item.description,
        available: item.quantity,
      })),
    };
  },
});

// Returns shop opening hours
export const getTimings = query({
  args: {},
  handler: async () => {
    return {
      opening: "8:00 AM",
      closing: "10:00 PM",
      days: "Monday – Sunday",
      note: "Open every day of the week",
    };
  },
});

// Returns available services
export const getServices = query({
  args: {},
  handler: async () => {
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
      ],
    };
  },
});
