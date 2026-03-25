"use client";

import Link from "next/link";
import {
  Coffee,
  Sparkles,
  Clock,
  Wifi,
  Star,
  MessageCircle,
  Leaf,
  MapPin,
  ArrowRight,
  Bot,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_LINKS = ["Menu", "About", "Location", "Hours"];

const FEATURES = [
  {
    icon: Bot,
    title: "AI-Powered Ordering",
    desc: "Chat with our AI barista to explore the menu, get recommendations, and place orders — all in natural language.",
    glow: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/40",
  },
  {
    icon: Leaf,
    title: "Ethically Sourced Beans",
    desc: "Every cup starts with single-origin, fair-trade beans selected by our expert roasters from farms we personally visit.",
    glow: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
  },
  {
    icon: Clock,
    title: "Open Early, Close Late",
    desc: "We're here when you need us — open from 6 AM to midnight, seven days a week, for every kind of coffee moment.",
    glow: "from-blue-500/20 to-indigo-500/10",
    iconColor: "text-blue-400",
    border: "border-blue-500/20 hover:border-blue-500/40",
  },
  {
    icon: Wifi,
    title: "Cozy & Connected",
    desc: "High-speed Wi-Fi, power outlets at every table, and comfortable seating designed for deep work or casual hangouts.",
    glow: "from-purple-500/20 to-violet-500/10",
    iconColor: "text-purple-400",
    border: "border-purple-500/20 hover:border-purple-500/40",
  },
];

const MENU_HIGHLIGHTS = [
  {
    name: "Signature Cold Brew",
    price: "$5.50",
    tag: "Best Seller",
    emoji: "🥤",
  },
  { name: "Honey Oat Latte", price: "$6.00", tag: "New", emoji: "🍯" },
  { name: "Espresso Tonic", price: "$5.00", tag: "Trending", emoji: "🫧" },
  { name: "Matcha Ceremonial", price: "$6.50", tag: "Fan Fave", emoji: "🍵" },
  { name: "Caramel Flat White", price: "$5.75", tag: "", emoji: "☕" },
  { name: "Iced Vanilla Cortado", price: "$5.25", tag: "", emoji: "🧊" },
];

const TESTIMONIALS = [
  {
    name: "Anika R.",
    role: "Remote Developer",
    text: "Brew Haven is my second office. The AI chat helped me discover my new favorite order in 30 seconds. Incredible vibes and even better coffee.",
    stars: 5,
  },
  {
    name: "James T.",
    role: "Coffee Enthusiast",
    text: "I've tried dozens of specialty shops. Brew Haven's single-origin pour-overs are on another level. The space is beautiful and the staff is welcoming.",
    stars: 5,
  },
  {
    name: "Priya M.",
    role: "Freelance Designer",
    text: "Fast Wi-Fi, cozy corners, and a menu that never gets boring. The AI assistant recommended the Espresso Tonic and I've been hooked ever since.",
    stars: 5,
  },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow">
              <Coffee size={18} className="text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Brew<span className="text-amber-400"> Haven</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {l}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/ai-chat"
              className="flex items-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:brightness-110 transition-all"
            >
              <Sparkles size={14} />
              Try AI Chat
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {l}
              </a>
            ))}
            <Link
              href="/ai-chat"
              className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              <Sparkles size={14} />
              Try AI Chat
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center overflow-hidden">
        {/* Background glow blobs */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-150 w-150 rounded-full bg-amber-500/8 blur-[120px]" />
        <div className="pointer-events-none absolute top-2/3 left-1/4 h-75 w-75 rounded-full bg-orange-600/10 blur-[80px]" />
        <div className="pointer-events-none absolute top-1/2 right-1/4 h-62.5 w-62.5 rounded-full bg-amber-400/6 blur-[90px]" />

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-400">
          <Sparkles size={12} />
          Now with AI-powered coffee discovery
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Where every cup tells{" "}
          <span className="bg-linear-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            a story
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
          Brew Haven blends artisan coffee craft with cutting-edge AI. Explore
          our menu, get personalized recommendations, and order — all through a
          natural conversation with our AI barista.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/ai-chat"
            className="group flex items-center gap-2.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-110 transition-all"
          >
            <MessageCircle size={18} />
            Try AI Chat
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <a
            href="#menu"
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-7 py-3.5 text-base font-semibold text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800 transition-all"
          >
            <Coffee size={18} />
            View Menu
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-xl w-full divide-x divide-zinc-800">
          {[
            { value: "4.9★", label: "Average rating" },
            { value: "50+", label: "Specialty drinks" },
            { value: "6AM–12AM", label: "Open daily" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-zinc-100">{value}</span>
              <span className="text-xs text-zinc-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="about" className="relative px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-amber-400 mb-3">
              Why Brew Haven
            </p>
            <h2 className="text-4xl font-bold tracking-tight">
              More than just coffee
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              We&apos;ve obsessed over every detail — from bean sourcing to your
              digital ordering experience.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(
              ({ icon: Icon, title, desc, glow, iconColor, border }) => (
                <div
                  key={title}
                  className={`relative overflow-hidden rounded-2xl border ${border} bg-zinc-900/80 p-6 transition-all hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${glow} opacity-50 pointer-events-none`}
                  />
                  <div className="relative">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 shadow-inner">
                      <Icon size={20} className={iconColor} />
                    </div>
                    <h3 className="mb-2 font-semibold text-zinc-100">
                      {title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── MENU HIGHLIGHTS ───────────────────────────────────── */}
      <section id="menu" className="px-6 py-24 bg-zinc-900/40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-amber-400 mb-3">
                Our Menu
              </p>
              <h2 className="text-4xl font-bold tracking-tight">
                Brewed to perfection
              </h2>
            </div>
            <Link
              href="/ai-chat"
              className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Get AI recommendations <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MENU_HIGHLIGHTS.map(({ name, price, tag, emoji }) => (
              <div
                key={name}
                className="group flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{emoji}</span>
                  <div>
                    <p className="font-medium text-zinc-100 group-hover:text-white transition-colors">
                      {name}
                    </p>
                    {tag && (
                      <span className="mt-0.5 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                        {tag}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-base font-semibold text-zinc-300 group-hover:text-amber-400 transition-colors">
                  {price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI CHAT PROMO BANNER ───────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-10 text-center shadow-2xl shadow-amber-500/5">
            {/* Decorative glow */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-500/10 via-transparent to-orange-600/8 rounded-3xl" />
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-linear-to-r from-transparent via-amber-500/50 to-transparent" />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/30">
                <Bot size={26} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Meet your AI barista
              </h2>
              <p className="mt-4 text-zinc-400 max-w-lg mx-auto">
                Not sure what to order? Our AI knows every drink, every
                ingredient, and every special. Just ask — it&apos;s like having
                your own personal coffee expert on demand.
              </p>
              <Link
                href="/ai-chat"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-110 transition-all"
              >
                <Sparkles size={16} />
                Start Chatting
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="px-6 py-24 bg-zinc-900/40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-amber-400 mb-3">
              Testimonials
            </p>
            <h2 className="text-4xl font-bold tracking-tight">
              Loved by regulars
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, text, stars }) => (
              <div
                key={name}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex gap-1">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed flex-1">
                  &ldquo;{text}&rdquo;
                </p>
                <div className="border-t border-zinc-800 pt-4">
                  <p className="font-medium text-zinc-100 text-sm">{name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATION & HOURS ──────────────────────────────────── */}
      <section id="location" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-amber-400 mb-3">
                Find Us
              </p>
              <h2 className="text-4xl font-bold tracking-tight mb-6">
                Come visit us
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <MapPin size={15} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-100">Location</p>
                    <p className="text-sm text-zinc-400">
                      42 Roaster Lane, Coffeeville, CA 94102
                    </p>
                  </div>
                </div>
                <div id="hours" className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <Clock size={15} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-100">Hours</p>
                    <p className="text-sm text-zinc-400">
                      Monday – Friday: 6:00 AM – 11:00 PM
                    </p>
                    <p className="text-sm text-zinc-400">
                      Saturday – Sunday: 7:00 AM – 12:00 AM
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <Wifi size={15} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-100">Free Wi-Fi</p>
                    <p className="text-sm text-zinc-400">
                      300 Mbps — password on your receipt
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="relative h-72 lg:h-96 w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 flex items-center justify-center">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent" />
              <div className="text-center">
                <MapPin size={40} className="text-amber-500/40 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">
                  42 Roaster Lane, Coffeeville
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800 px-6 py-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-orange-600">
              <Coffee size={15} className="text-white" />
            </span>
            <span className="font-bold text-sm">
              Brew<span className="text-amber-400"> Haven</span>
            </span>
          </Link>

          <p className="text-xs text-zinc-600 text-center">
            © {new Date().getFullYear()} Brew Haven. Crafted with ☕ and AI.
          </p>

          <Link
            href="/ai-chat"
            className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles size={12} />
            Try AI Chat
          </Link>
        </div>
      </footer>
    </div>
  );
}
