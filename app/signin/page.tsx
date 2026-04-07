"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import {
  Coffee,
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";

const COFFEE_HERO_IMAGE =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=80";
const COFFEE_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const currentUser = useQuery(
    api.users.currentUser,
    !isAuthenticated ? "skip" : {},
  );
  const router = useRouter();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser?.role === "owner") {
      router.replace("/admin/menu");
    }
    if (!authLoading && currentUser?.role === "customer") {
      router.replace("/");
    }
  }, [authLoading, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow,
        ...(flow === "signUp" ? { name: name.trim() } : {}),
      });
    } catch (err) {
      setError(
        flow === "signUp"
          ? "Could not create account. Email may already be in use."
          : "Invalid email or password.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0908] text-white">
      <div className="absolute inset-0 opacity-9">
        <Image
          src={COFFEE_HERO_IMAGE}
          alt="Coffee shop background"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-18%] h-112 w-md rounded-full bg-amber-500/25 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-12%] h-136 w-136 rounded-full bg-orange-500/20 blur-3xl animate-pulse-glow delay-300" />
        <div className="absolute left-[38%] top-[12%] h-36 w-36 rounded-full border border-white/10 bg-white/5 blur-2xl animate-float" />
      </div>

      <div className="noise-overlay relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="animate-fade-in-up hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-600 shadow-lg shadow-amber-500/40">
              <Coffee size={22} className="text-white" />
            </span>
            <span
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Brew<span className="text-amber-400"> Haven</span>
            </span>
          </Link>

          <div className="mt-10 max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs tracking-wide text-amber-300">
              <Sparkles size={14} />
              Crafted for modern coffee lovers
            </p>
            <h1
              className="mt-6 text-5xl leading-tight font-semibold text-stone-100"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Taste-first ordering,
              <span className="gradient-text-amber block">
                designed like luxury tech.
              </span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-stone-300">
              Manage favorites, reorder in seconds, and track every cup with a
              premium sign-in experience built for today.
            </p>
          </div>

          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
            <div className="glass-card hover-lift rounded-2xl p-4">
              <ShieldCheck size={18} className="text-emerald-300" />
              <p className="mt-3 text-xs text-stone-300">Secure checkout</p>
            </div>
            <div className="glass-card hover-lift rounded-2xl p-4">
              <Clock3 size={18} className="text-amber-300" />
              <p className="mt-3 text-xs text-stone-300">Fast reordering</p>
            </div>
            <div className="glass-card hover-lift rounded-2xl p-4">
              <Coffee size={18} className="text-orange-300" />
              <p className="mt-3 text-xs text-stone-300">Daily specials</p>
            </div>
          </div>
        </section>

        <section className="animate-fade-in-up w-full">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-black/35 p-8 backdrop-blur-2xl shadow-2xl shadow-black/40">
            <Link
              href="/"
              className="mb-8 flex items-center justify-center gap-3 lg:hidden"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-600 shadow-lg shadow-amber-500/35">
                <Coffee size={20} className="text-white" />
              </span>
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Brew<span className="text-amber-400"> Haven</span>
              </span>
            </Link>

            <div className="mb-7">
              <div className="relative mb-5 overflow-hidden rounded-2xl border border-white/10 lg:hidden">
                <Image
                  src={COFFEE_BANNER_IMAGE}
                  alt="Brew Haven coffee bar"
                  width={1200}
                  height={800}
                  className="h-32 w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0a0908]/75 via-transparent to-transparent" />
                <p className="absolute bottom-2 left-3 text-[11px] tracking-wide text-amber-200">
                  Brew Haven Coffee House
                </p>
              </div>

              <h2 className="text-2xl font-semibold text-white">
                {flow === "signIn" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-sm text-stone-400">
                {flow === "signIn"
                  ? "Sign in to order your favorite coffee"
                  : "Join Brew Haven and start a better coffee routine"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {flow === "signUp" && (
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                  />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 py-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition-all hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {flow === "signIn" ? "Sign In" : "Create Account"}
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setFlow(flow === "signIn" ? "signUp" : "signIn");
                  setError("");
                }}
                className="text-xs text-stone-400 transition-colors hover:text-amber-300"
              >
                {flow === "signIn"
                  ? "New here? Create your Brew Haven account"
                  : "Already a member? Sign in instead"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
