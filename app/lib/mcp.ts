import OpenAI from "openai";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
      try {
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
        console.log("[placeOrder] Received items:", JSON.stringify(items));
        const totalPrice = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        // 1. Create a pending order in Convex
        const orderId = await convex.mutation(api.orders.create, {
          items: items.map((item) => ({
            menuItemId: item.menuItemId as Id<"menu">,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalPrice,
        });
        console.log("[placeOrder] Pending order created:", orderId);

        // 2. Create a Stripe Checkout Session directly
        const origin =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
          items.map((item) => ({
            price_data: {
              currency: "usd",
              product_data: { name: item.name },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          }));

        const session = await stripe.checkout.sessions.create({
          line_items: lineItems,
          mode: "payment",
          success_url: `${origin}/payment/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/?payment=cancelled`,
          metadata: { orderId },
        });
        console.log("[placeOrder] Session id:", session.id, "url:", session.url);

        const url = session.url;
        console.log("[placeOrder] Stripe checkout URL:", url);

        return JSON.stringify({
          success: true,
          orderId,
          totalPrice: totalPrice.toFixed(2),
          paymentUrl: url,
          message: `Order created! Total: $${totalPrice.toFixed(2)}. Please complete payment using the link below.`,
        });
      } catch (err: unknown) {
        console.error("[placeOrder] Error:", err);
        const message = err instanceof Error ? err.message : String(err);
        return JSON.stringify({ success: false, error: message });
      }
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}
