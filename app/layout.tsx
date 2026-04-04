import type { Metadata } from "next";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="h-full" suppressHydrationWarning>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
