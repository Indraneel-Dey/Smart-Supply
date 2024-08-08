import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Supply",
  description: "Optimize inventory by leveraging Crop Doctor insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`p-6 pb-0 h-full ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
