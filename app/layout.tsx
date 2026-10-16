import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const font = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Data Top-up",
  description: "Buy mobile data in seconds.",
  appleWebApp: { capable: true, title: "Top-up" },
};

export const viewport: Viewport = { themeColor: "#0B7A75" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
