import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // If STRIPE_WEBHOOK_SECRET is set, verify the signature.
  // For local dev without webhook CLI, we skip verification.
  let event: Stripe.Event;

  if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return new Response("Webhook signature verification failed", {
        status: 400,
      });
    }
  } else {
    // For local development without webhook secret
    event = JSON.parse(body) as Stripe.Event;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        console.log("[Webhook] Payment confirmed for order:", orderId);
        // markPaid atomically: updates status, decrements stock, sends chat message
        await convex.mutation(api.orders.markPaid, {
          id: orderId as Id<"orders">,
        });
        console.log("[Webhook] Order processed successfully");
      } catch (err) {
        console.error("[Webhook] Failed to mark order paid:", err);
        return new Response("Failed to process webhook", { status: 500 });
      }
    }
  }

  return new Response("OK", { status: 200 });
}
