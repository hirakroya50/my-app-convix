import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { orderId, sessionId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return Response.json({ error: "orderId is required" }, { status: 400 });
    }
    if (!sessionId || typeof sessionId !== "string") {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.orderId !== orderId) {
      return Response.json(
        { error: "Stripe session does not match order" },
        { status: 400 },
      );
    }
    if (session.payment_status !== "paid") {
      return Response.json({ ok: false, status: session.payment_status });
    }

    const result = await convex.mutation(api.orders.confirmPaid, {
      id: orderId as Id<"orders">,
      stripeSessionId: session.id,
    });

    return Response.json(result);
  } catch (error) {
    console.error("[Checkout Confirm] Error:", error);
    return Response.json(
      { error: "Failed to confirm payment" },
      { status: 500 },
    );
  }
}
