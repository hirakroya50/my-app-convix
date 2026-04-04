// Stripe webhook proxy — forwards to Convex HTTP action for processing.
// Configure your Stripe webhook URL to point to your Convex deployment:
//   https://<your-deployment>.convex.site/webhook/stripe
// This Next.js route exists as a local dev convenience.

export async function POST(req: Request) {
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
    ".cloud",
    ".site",
  );
  if (!convexSiteUrl) {
    return new Response("Convex URL not configured", { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (sig) headers["stripe-signature"] = sig;

  try {
    const response = await fetch(`${convexSiteUrl}/webhook/stripe`, {
      method: "POST",
      headers,
      body,
    });
    return new Response(await response.text(), { status: response.status });
  } catch (err) {
    console.error("[Webhook proxy] Error:", err);
    return new Response("Failed to proxy webhook", { status: 500 });
  }
}
