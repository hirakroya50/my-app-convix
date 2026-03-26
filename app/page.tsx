"use client";

import Link from "next/link";
import Image from "next/image";
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
  ChevronDown,
  Phone,
  Globe,
  Share2,
  Heart,
  Award,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ChatWidget from "./components/ChatWidget";

const NAV_LINKS = ["Menu", "About", "Gallery", "Location"];

const STATS = [
  { value: "4.9", suffix: "★", label: "Average rating" },
  { value: "50", suffix: "+", label: "Specialty drinks" },
  { value: "12", suffix: "K+", label: "Happy customers" },
  { value: "6AM", suffix: "–12AM", label: "Open daily" },
];

const FEATURES = [
  {
    icon: Bot,
    title: "AI-Powered Barista",
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

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
      {/* ── FLOATING CHAT WIDGET ─────────────────────────────── */}
      <ChatWidget />
    </div>
  );
}
