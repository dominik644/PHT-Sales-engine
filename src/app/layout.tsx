import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { DemoBanner } from "@/components/DemoBanner";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "PHT Hygiene",
    template: "%s · PHT Hygiene",
  },
  description:
    "PHT Hygiene B2B-Webshop — Hygienetechnik, Desinfektion und Verbrauchsmaterial mit ERP-Anbindung.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable} h-full`}>
      <body className="page-shell antialiased">
        <CartProvider>
          <DemoBanner />
          <Header />
          <main className="page-main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
