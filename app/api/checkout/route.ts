import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return Response.json({ error: "orderId is required" }, { status: 400 });
    }

    // Fetch the order from Convex
    const order = await convex.query(api.orders.get, {
      id: orderId as Id<"orders">,
    });
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status === "paid") {
      return Response.json({ error: "Order already paid" }, { status: 400 });
    }

    // Build Stripe line items from the order
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // cents
        },
        quantity: item.quantity,
      }));

    // Determine base URL
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/payment/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled`,
      metadata: {
        orderId,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
