import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brew Haven — Artisan Coffee & AI Barista",
  description:
    "Brew Haven blends artisan coffee craft with cutting-edge AI. Explore our menu, get personalized recommendations, and order through a natural conversation with our AI barista.",
  keywords:
    "coffee shop, artisan coffee, AI barista, specialty coffee, cold brew, espresso",
  openGraph: {
    title: "Brew Haven — Artisan Coffee & AI Barista",
    description:
      "Brew Haven blends artisan coffee craft with cutting-edge AI. Explore our menu, get personalized recommendations, and order through a natural conversation with our AI barista.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="h-full" suppressHydrationWarning>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
