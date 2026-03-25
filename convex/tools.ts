import { query } from "./_generated/server";

// Returns the coffee shop menu
export const getMenu = query({
  args: {},
  handler: async () => {
    return {
      shopName: "Brew Haven",
      items: [
        { name: "Espresso", price: "$3.50", description: "Rich and bold single shot" },
        { name: "Cappuccino", price: "$4.50", description: "Espresso with steamed milk foam" },
        { name: "Latte", price: "$5.00", description: "Smooth espresso with steamed milk" },
        { name: "Cold Brew", price: "$4.00", description: "Slow-steeped cold coffee" },
      ],
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
        { name: "Free WiFi", description: "High-speed internet throughout the shop" },
        { name: "Takeaway", description: "Grab your favorite drink on the go" },
        { name: "Dine-in", description: "Cozy seating for a relaxed experience" },
      ],
    };
  },
});
