import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: "NTC | Toastmasters Club",
  description: "NTC Toastmasters Club Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
