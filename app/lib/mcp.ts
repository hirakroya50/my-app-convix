import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// MCP-style tool definitions for OpenAI function calling
export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getMenu",
      description:
        "Get the Brew Haven coffee shop menu with all available drinks, their prices, and stock. Always call this when the user asks about menu, drinks, or what is available.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getTimings",
      description: "Get the Brew Haven coffee shop opening and closing hours",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getServices",
      description:
        "Get the list of services offered by Brew Haven coffee shop (WiFi, takeaway, dine-in, etc.)",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "placeOrder",
      description:
        "Place an order for the customer. Call this ONLY after the customer has confirmed the items they want. Pass the items array with each item's menuItemId, name, price, and quantity.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                menuItemId: {
                  type: "string",
                  description: "The menu item ID from getMenu results",
                },
                name: {
                  type: "string",
                  description: "The display name of the item",
                },
                price: {
                  type: "number",
                  description: "The price per unit as a number",
                },
                quantity: {
                  type: "number",
                  description: "How many of this item",
                },
              },
              required: ["menuItemId", "name", "price", "quantity"],
            },
            description: "Array of items to order",
          },
        },
        required: ["items"],
      },
    },
  },
];

// Execute a tool call by querying the corresponding Convex function
export async function executeTool(
  convex: ConvexHttpClient,
  toolName: string,
  toolArgs?: string,
): Promise<string> {
  switch (toolName) {
    case "getMenu":
      return JSON.stringify(await convex.query(api.tools.getMenu));
    case "getTimings":
      return JSON.stringify(await convex.query(api.tools.getTimings));
    case "getServices":
      return JSON.stringify(await convex.query(api.tools.getServices));
    case "placeOrder": {
      const args = JSON.parse(toolArgs || "{}");
      const items = args.items as Array<{
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
      }>;
      if (!items || items.length === 0) {
        return JSON.stringify({ error: "No items provided" });
      }
      const totalPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      try {
        const orderId = await convex.mutation(api.orders.create, {
          items: items.map((item) => ({
            menuItemId: item.menuItemId as Id<"menu">,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalPrice,
        });
        return JSON.stringify({
          success: true,
          orderId,
          totalPrice: totalPrice.toFixed(2),
          message: "Order placed and paid successfully!",
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Order failed";
        return JSON.stringify({ success: false, error: message });
      }
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}
