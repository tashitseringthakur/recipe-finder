import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Core website information
  title: "Recipe Recommender",
  description: "Discover delicious recipes based on the ingredients you have at home. Powered by Python and Next.js.",
  keywords: ["Recipe", "Recommender", "Cooking", "Ingredients", "Food", "Python", "Next.js", "React"],
  authors: [{ name: "Tashi" }],

  // Open Graph (for social sharing on sites like Facebook, LinkedIn)
  openGraph: {
    title: "Recipe Recommender",
    description: "Find your next favorite meal with this smart recipe recommender.",
    url: "https://tashitseringthakur.github.io/recipe-finder/", // Updated to your project's URL
    siteName: "Recipe Recommender",
    type: "website",
  },
  
  // Twitter Card (for sharing on Twitter)
  twitter: {
    card: "summary_large_image",
    title: "Recipe Recommender by Tashi",
    description: "Discover delicious recipes based on ingredients you have. Powered by Python and Next.js.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}