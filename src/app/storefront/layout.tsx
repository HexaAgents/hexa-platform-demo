import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./storefront.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apex Industrial Supply | Industrial Parts & Equipment",
  description:
    "Your trusted source for industrial parts, equipment, and supplies. Over 150+ products with same-day shipping.",
};

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`storefront ${inter.variable}`}>
      {children}
    </div>
  );
}
