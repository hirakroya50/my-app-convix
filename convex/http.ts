import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";
import Stripe from "stripe";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

// Stripe webhook — handles checkout.session.completed events
http.route({
  path: "/webhook/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      if (process.env.NODE_ENV === "production") {
        return new Response("Webhook secret not configured", { status: 500 });
      }
      event = JSON.parse(body) as Stripe.Event;
    } else if (!sig) {
      return new Response("Missing stripe-signature header", { status: 400 });
    } else {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET,
        );
      } catch {
        return new Response("Webhook signature verification failed", {
          status: 400,
        });
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        try {
          await ctx.runMutation(internal.orders.markPaid, {
            id: orderId as Id<"orders">,
            stripeSessionId: session.id,
          });
        } catch (err) {
          console.error("[Webhook] Failed to mark order paid:", err);
          return new Response("Failed to process webhook", { status: 500 });
        }
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
