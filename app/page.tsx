"use client";

import Link from "next/link";
import Image from "next/image";
import { useConvexAuth, useQuery } from "convex/react";
import {
  Coffee,
  Sparkles,
  Clock,
  Wifi,
  Star,
  MessageCircle,
  Leaf,
  MapPin,
  Menu,
  X,
  ChevronDown,
  Phone,
  Award,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import ChatWidget from "./components/ChatWidget";
import { useAuthActions } from "@convex-dev/auth/react";

const NAV_LINKS = ["Menu", "About", "Gallery", "Location"];

const STATS = [
  { value: "4.9", suffix: "★", label: "Average rating" },
  { value: "50", suffix: "+", label: "Specialty drinks" },
  { value: "12", suffix: "K+", label: "Happy customers" },
  { value: "6AM", suffix: "–12AM", label: "Open daily" },
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: "AI-Powered Ordering",
    desc: "Chat naturally to explore the menu, get curated recommendations, and place orders — no app download needed.",
    glow: "from-amber-500/15 to-orange-500/5",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
    accent: "group-hover:border-amber-500/50",
  },
  {
    icon: Leaf,
    title: "Ethically Sourced",
    desc: "Single-origin, fair-trade beans hand-picked from farms we personally visit across three continents.",
    glow: "from-emerald-500/15 to-teal-500/5",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
    accent: "group-hover:border-emerald-500/50",
  },
  {
    icon: Award,
    title: "Award-Winning Roasts",
    desc: "Our in-house roaster has won five national championships. Every batch is precision-roasted to order.",
    glow: "from-violet-500/15 to-purple-500/5",
    iconBg: "bg-violet-500/10 border-violet-500/20",
    iconColor: "text-violet-400",
    accent: "group-hover:border-violet-500/50",
  },
  {
    icon: Wifi,
    title: "Cozy & Connected",
    desc: "300 Mbps Wi-Fi, power at every table, and noise-optimised acoustics designed for deep focus or easy conversations.",
    glow: "from-sky-500/15 to-blue-500/5",
    iconBg: "bg-sky-500/10 border-sky-500/20",
    iconColor: "text-sky-400",
    accent: "group-hover:border-sky-500/50",
  },
];

const MENU_HIGHLIGHTS = [
  {
    name: "Signature Cold Brew",
    price: "$5.50",
    tag: "Best Seller",
    desc: "18-hour steep, nitrogen-kissed, served over hand-cut ice",
    emoji: "🥤",
    tagColor: "bg-amber-500/15 text-amber-400",
  },
  {
    name: "Honey Oat Latte",
    price: "$6.00",
    tag: "New",
    desc: "Local wildflower honey, oat milk, double ristretto",
    emoji: "🍯",
    tagColor: "bg-emerald-500/15 text-emerald-400",
  },
  {
    name: "Espresso Tonic",
    price: "$5.00",
    tag: "Trending",
    desc: "Chilled tonic, orange peel, a bold espresso float",
    emoji: "🫧",
    tagColor: "bg-sky-500/15 text-sky-400",
  },
  {
    name: "Matcha Ceremonial",
    price: "$6.50",
    tag: "Fan Fave",
    desc: "Grade-A Japanese matcha, steamed oat milk, light foam",
    emoji: "🍵",
    tagColor: "bg-violet-500/15 text-violet-400",
  },
  {
    name: "Caramel Flat White",
    price: "$5.75",
    tag: "",
    desc: "Velvety micro-foam, salted caramel drizzle, two ristrettos",
    emoji: "☕",
    tagColor: "",
  },
  {
    name: "Iced Vanilla Cortado",
    price: "$5.25",
    tag: "",
    desc: "1:1 espresso-to-milk ratio, Madagascar vanilla, crushed ice",
    emoji: "🧊",
    tagColor: "",
  },
];

const GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
    alt: "Cozy coffee shop interior with warm lighting",
    span: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    alt: "Latte art close-up",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
    alt: "Espresso being pulled",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80",
    alt: "Coffee beans roasting",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80",
    alt: "Iced cold brew with milk swirl",
    span: "col-span-1 row-span-1",
  },
];

const TESTIMONIALS = [
  {
    name: "Anika R.",
    role: "Remote Developer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    text: "Brew Haven is my second office. The AI chat helped me discover my new favourite order in 30 seconds. Incredible vibes and even better coffee.",
    stars: 5,
  },
  {
    name: "James T.",
    role: "Coffee Enthusiast",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    text: "I've tried dozens of specialty shops. Brew Haven's single-origin pour-overs are on another level. The space is beautiful and the staff is so welcoming.",
    stars: 5,
  },
  {
    name: "Priya M.",
    role: "Freelance Designer",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    text: "Fast Wi-Fi, cozy corners, and a menu that never gets boring. The AI barista recommended the Espresso Tonic and I've been hooked ever since.",
    stars: 5,
  },
];

/* ─── Animated counter hook ──────────────────────────────── */
function useCountUp(target: string, duration = 1800, start = false) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!start) return;
    const num = parseFloat(target);
    if (isNaN(num)) {
      // Use a RAF so the state update is deferred outside the effect body
      const id = requestAnimationFrame(() => setDisplay(target));
      return () => cancelAnimationFrame(id);
    }
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = num * eased;
      setDisplay(
        Number.isInteger(num)
          ? Math.round(current).toString()
          : current.toFixed(1),
      );
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return display;
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({
  value,
  suffix,
  label,
  started,
}: {
  value: string;
  suffix: string;
  label: string;
  started: boolean;
}) {
  const animated = useCountUp(value, 1600, started);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
        {animated}
        <span className="text-amber-400">{suffix}</span>
      </span>
      <span className="text-xs text-stone-500 tracking-wide">{label}</span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.users.currentUser);
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const signedInLabel =
    currentUser?.name ||
    currentUser?.email ||
    (isAuthenticated ? "Signed in" : null);

  useEffect(() => {
    if (currentUser?.role === "owner") {
      router.replace("/admin/menu");
    }
  }, [currentUser, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsStarted(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0908] text-stone-100 overflow-x-hidden">
      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0a0908]/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/40"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-600 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow duration-300">
              <Coffee size={18} className="text-white" />
            </span>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Brew<span className="text-amber-400"> Haven</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm text-stone-400 hover:text-white transition-colors duration-200 tracking-wide"
              >
                {l}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {!authLoading && isAuthenticated && signedInLabel && (
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-stone-300">
                  Signed in as{" "}
                  <span className="font-semibold text-white">
                    {signedInLabel}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-stone-200 hover:bg-white/8 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
            {currentUser?.role === "owner" ? (
              <Link
                href="/admin/menu"
                className="group relative flex items-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:brightness-110 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                <Coffee size={14} />
                Owner Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="group relative flex items-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:brightness-110 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                <Coffee size={14} />
                Order Now
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0a0908]/95 backdrop-blur-xl px-6 py-5 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-stone-400 hover:text-white transition-colors tracking-wide"
              >
                {l}
              </a>
            ))}
            {!authLoading && isAuthenticated && signedInLabel && (
              <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                <p className="text-[11px] text-stone-500">Signed in as</p>
                <p className="text-sm font-semibold text-white truncate">
                  {signedInLabel}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void signOut();
                    setMobileOpen(false);
                  }}
                  className="mt-3 w-full rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-stone-200 hover:bg-white/8 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
            {currentUser?.role === "owner" ? (
              <Link
                href="/admin/menu"
                className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white mt-1"
                onClick={() => setMobileOpen(false)}
              >
                <Coffee size={14} />
                Owner Dashboard
              </Link>
            ) : (
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white mt-1"
                onClick={() => {
                  setChatOpen(true);
                  setMobileOpen(false);
                }}
              >
                <Coffee size={14} />
                Order Now
              </button>
            )}
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Full-bleed hero image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&q=85"
            alt="Brew Haven coffee shop interior"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          {/* Multi-layer gradient overlay for drama */}
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-[#0a0908]" />
          <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />
          {/* Warm amber glow at center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-24 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/8 px-4 py-1.5 text-xs font-medium text-amber-300 backdrop-blur-sm animate-fade-in">
            <Sparkles size={11} />
            Now with AI-powered coffee discovery
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-none tracking-tight text-white animate-fade-in-up"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Where every cup
            <br />
            <span className="gradient-text-amber animate-shimmer">
              tells a story
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base sm:text-lg text-stone-300 leading-relaxed animate-fade-in-up delay-200">
            Brew Haven blends artisan coffee craft with cutting-edge AI. Explore
            our curated menu, get personalised recommendations, and order — all
            through a natural conversation with our AI barista.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-300">
            <a
              href="#menu"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              <Coffee size={18} />
              Explore Menu
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-scroll-bounce z-10">
          <span className="text-xs text-stone-500 tracking-widest uppercase">
            Scroll
          </span>
          <ChevronDown size={16} className="text-stone-500" />
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <div
        ref={statsRef}
        className="relative border-y border-white/5 bg-white/2"
      >
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 divide-x-0 sm:divide-x divide-white/8">
            {STATS.map(({ value, suffix, label }) => (
              <StatCard
                key={label}
                value={value}
                suffix={suffix}
                label={label}
                started={statsStarted}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="about" className="relative px-6 py-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-600/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-4">
              Why Brew Haven
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              More than just
              <br />
              <span className="gradient-text-amber">a coffee shop</span>
            </h2>
            <p className="mt-5 text-stone-400 text-lg leading-relaxed">
              We&apos;ve obsessed over every detail — from sourcing the
              world&apos;s finest beans to building the seamless digital
              experience you deserve.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(
              ({
                icon: Icon,
                title,
                desc,
                glow,
                iconBg,
                iconColor,
                accent,
              }) => (
                <div
                  key={title}
                  className={`group relative overflow-hidden rounded-3xl border border-white/6 bg-white/3 p-7 transition-all duration-300 hover:-translate-y-2 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50 ${accent}`}
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${glow} opacity-60 pointer-events-none transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <div className="relative">
                    <div
                      className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border ${iconBg}`}
                    >
                      <Icon size={20} className={iconColor} />
                    </div>
                    <h3 className="mb-2.5 font-semibold text-white text-base">
                      {title}
                    </h3>
                    <p className="text-sm text-stone-400 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── SPLIT SECTION — Story ────────────────────────────── */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image collage */}
            <div className="relative h-130 lg:h-155">
              <div className="absolute top-0 left-0 w-[65%] h-[72%] rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                <Image
                  src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=700&q=80"
                  alt="Barista crafting latte art"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 60vw, 30vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 right-0 w-[55%] h-[60%] rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5">
                <Image
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80"
                  alt="Coffee beans close up"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating stat card */}
              <div className="absolute bottom-[42%] right-[48%] translate-x-1/2 translate-y-1/2 glass-card rounded-2xl px-5 py-4 shadow-xl border border-white/8 z-10 backdrop-blur-xl bg-[#0a0908]/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
                    <TrendingUp size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-100 font-bold">Founded</p>
                    <p className="font-bold text-white text-sm">Since 2018</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-4">
                Our Story
              </p>
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-white mb-6"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Crafted with passion,
                <br />
                <span className="gradient-text-amber">served with love</span>
              </h2>
              <p className="text-stone-400 leading-relaxed mb-5 text-base">
                What started as a small neighbourhood roastery in 2018 has grown
                into Coffeeville&apos;s most beloved specialty café. We believe
                great coffee is a conversation — so we built an AI barista to
                make that conversation happen anywhere, anytime.
              </p>
              <p className="text-stone-400 leading-relaxed mb-8 text-base">
                Our beans travel from the highlands of Ethiopia, the hills of
                Colombia, and the islands of Indonesia — each lot traceable back
                to the specific farm, farmer, and harvest season.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                {[
                  { n: "3", label: "Origin countries" },
                  { n: "8", label: "Roast profiles" },
                  { n: "5★", label: "Championship wins" },
                ].map(({ n, label }) => (
                  <div
                    key={label}
                    className="border-l-2 border-amber-500/40 pl-4"
                  >
                    <div
                      className="text-2xl font-bold text-white"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {n}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MENU HIGHLIGHTS ──────────────────────────────────── */}
      <section id="menu" className="relative px-6 py-28 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-amber-950/5 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl relative">
          <div className="mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-4">
                Our Menu
              </p>
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight text-white"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Brewed to
                <br />
                <span className="gradient-text-amber">perfection</span>
              </h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MENU_HIGHLIGHTS.map(
              ({ name, price, tag, desc, emoji, tagColor }) => (
                <div
                  key={name}
                  className="group relative overflow-hidden rounded-2xl border border-white/6 bg-white/3 p-5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-amber-500/0 to-transparent group-hover:from-amber-500/3 transition-all duration-300 pointer-events-none" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <span className="text-3xl shrink-0 leading-none pt-0.5">
                        {emoji}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <p className="font-semibold text-white text-sm">
                            {name}
                          </p>
                          {tag && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagColor}`}
                            >
                              {tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-bold text-amber-400 shrink-0 group-hover:text-amber-300 transition-colors">
                      {price}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────── */}
      <section id="gallery" className="px-6 py-10 pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-4">
              The Experience
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              A space you&apos;ll
              <span className="gradient-text-amber"> love</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 grid-rows-2 gap-3 h-120 sm:h-145">
            {GALLERY_IMAGES.map(({ src, alt, span }) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-2xl ${span} group`}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="px-6 py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/1.5 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl relative">
          <div className="mb-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-4">
              Testimonials
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Loved by <span className="gradient-text-amber">regulars</span>
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, avatar, text, stars }, idx) => (
              <div
                key={name}
                className="relative flex flex-col gap-5 rounded-3xl border border-white/6 bg-white/3 p-7 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-stone-300 leading-relaxed flex-1">
                  &ldquo;{text}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-white/6 pt-5">
                  <Image
                    src={avatar}
                    alt={name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover ring-2 ring-amber-500/20"
                  />
                  <div>
                    <p className="font-semibold text-white text-sm">{name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATION & HOURS ─────────────────────────────────── */}
      <section id="location" className="px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-4">
                Find Us
              </p>
              <h2
                className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-10 leading-tight"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Come visit
                <br />
                <span className="gradient-text-amber">us anytime</span>
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: MapPin,
                    title: "Location",
                    lines: ["42 Roaster Lane", "Coffeeville, CA 94102"],
                  },
                  {
                    icon: Clock,
                    title: "Hours",
                    lines: [
                      "Mon – Fri: 6:00 AM – 11:00 PM",
                      "Sat – Sun: 7:00 AM – 12:00 AM",
                    ],
                    id: "hours",
                  },
                  {
                    icon: Wifi,
                    title: "Free Wi-Fi",
                    lines: ["300 Mbps — password on your receipt"],
                  },
                  {
                    icon: Phone,
                    title: "Call Us",
                    lines: ["+1 (415) 555-0182"],
                  },
                ].map(({ icon: Icon, title, lines, id }) => (
                  <div key={title} id={id} className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <Icon size={16} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm mb-1">
                        {title}
                      </p>
                      {lines.map((l) => (
                        <p key={l} className="text-sm text-stone-400">
                          {l}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map / Image placeholder */}
            <div className="relative h-80 lg:h-125 w-full overflow-hidden rounded-3xl border border-white/6">
              <Image
                src="https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=900&q=80"
                alt="Coffee shop storefront"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2">
                  <MapPin size={13} className="text-amber-400" />
                  <span className="text-xs text-white font-medium">
                    42 Roaster Lane, Coffeeville
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────── */}
      {/* <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Stay in the loop
          </h2>
          <p className="text-stone-400 mb-8 text-sm">
            Get weekly specials, new menu drops, and exclusive offers straight
            to your inbox.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
            <button
              type="submit"
              className="rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section> */}

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 pt-14 pb-8 border-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid sm:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-600">
                  <Coffee size={16} className="text-white" />
                </span>
                <span
                  className="font-bold"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Brew<span className="text-amber-400"> Haven</span>
                </span>
              </Link>
              <p className="text-xs text-stone-300 leading-relaxed max-w-xs">
                Artisan coffee, ethically sourced. A space to work, connect, and
                savour the moment.
              </p>
              {/* <div className="flex gap-3 mt-5">
                {[Globe, Share2, Heart].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white transition-all"
                    aria-label="Social link"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div> */}
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-300 mb-4">
                Explore
              </p>
              <div className="flex flex-col gap-2.5">
                {["Menu", "About", "Gallery", "Location"].map((l) => (
                  <a
                    key={l}
                    href={`#${l.toLowerCase()}`}
                    className="text-sm text-stone-300 hover:text-white transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-300 mb-4">
                Visit Us
              </p>
              <div className="flex flex-col gap-1 text-sm text-stone-300">
                <span>42 Roaster Lane, Coffeeville CA</span>
                <span>Mon–Fri 6AM–11PM</span>
                <span>Sat–Sun 7AM–12AM</span>
                <a
                  href="tel:+14155550182"
                  className="hover:text-amber-400 transition-colors"
                >
                  +1 (415) 555-0182
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-xs text-stone-400">
              © {new Date().getFullYear()} Brew Haven. Crafted with ☕ and AI.
            </p>
            {/* <div className="flex gap-5 text-xs text-stone-400">
              <a href="#" className="hover:text-stone-200 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-stone-200 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-stone-200 transition-colors">
                Cookies
              </a>
            </div> */}
          </div>
        </div>
      </footer>

      {/* ── FLOATING CHAT WIDGET ─────────────────────────────── */}
      <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
