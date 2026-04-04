"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Suspense } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Coffee,
  ArrowLeft,
  Loader2,
  XCircle,
  Clock,
} from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") as Id<"orders"> | null;

  const order = useQuery(api.orders.get, orderId ? { id: orderId } : "skip");

  if (!orderId) {
    return (
      <div className="min-h-screen bg-[#0a0908] flex items-center justify-center px-6">
        <div className="text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-stone-400 text-sm mb-6">No order ID found.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm"
          >
            <ArrowLeft size={14} />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0908] flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2
            size={32}
            className="text-amber-400 animate-spin mx-auto mb-4"
          />
          <p className="text-stone-400 text-sm">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-screen bg-[#0a0908] flex items-center justify-center px-6">
        <div className="text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Order Not Found</h1>
          <p className="text-stone-400 text-sm mb-6">This order may not belong to your account.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm"
          >
            <ArrowLeft size={14} />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.status !== "pending";

  return (
    <div className="min-h-screen bg-[#0a0908] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Status icon */}
        <div className={`mb-6 inline-flex items-center justify-center h-20 w-20 rounded-full ${
          isPaid
            ? "bg-emerald-500/10 border border-emerald-500/20"
            : "bg-amber-500/10 border border-amber-500/20"
        }`}>
          {isPaid ? (
            <CheckCircle2 size={40} className="text-emerald-400" />
          ) : (
            <Clock size={40} className="text-amber-400 animate-pulse" />
          )}
        </div>

        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {isPaid ? "Payment Successful!" : "Processing Payment…"}
        </h1>
        <p className="text-stone-400 mb-8">
          {isPaid
            ? "Your order has been confirmed. We'll start preparing it shortly."
            : "Your payment is being processed. This page will update automatically."}
        </p>

        {/* Order summary card */}
        <div className="rounded-2xl border border-white/6 bg-white/3 p-6 text-left mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Coffee size={16} className="text-amber-400" />
            <h2 className="font-semibold text-white text-sm">Order Summary</h2>
          </div>
          <div className="space-y-2 mb-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-stone-300">
                  {item.quantity}× {item.name}
                </span>
                <span className="text-stone-400">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 pt-3 flex items-center justify-between">
            <span className="font-semibold text-white text-sm">Total</span>
            <span className="font-bold text-amber-400 text-lg">
              ${order.totalPrice.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
              order.status === "paid" || order.status === "preparing" || order.status === "ready"
                ? "bg-emerald-500/15 text-emerald-400"
                : order.status === "pending"
                  ? "bg-amber-500/15 text-amber-400"
                  : order.status === "picked_up"
                    ? "bg-sky-500/15 text-sky-400"
                    : "bg-red-500/15 text-red-400"
            }`}>
              {order.status === "picked_up" ? "Picked Up" : order.status}
            </span>
            <span className="text-xs text-stone-600">
              {new Date(order.timestamp).toLocaleString()}
            </span>
          </div>
          {order.pickupName && (
            <p className="mt-2 text-xs text-stone-500">
              Pickup name: <span className="text-stone-300">{order.pickupName}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white hover:brightness-110 transition-all"
          >
            <Coffee size={16} />
            Back to Brew Haven
          </Link>
          {isPaid && (
            <p className="text-xs text-stone-600">
              A confirmation message has been sent to your chat. Please pick up at the counter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0908] flex items-center justify-center">
          <Loader2 size={32} className="text-amber-400 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
