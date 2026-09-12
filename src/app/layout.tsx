import type { Metadata } from "next";
import { Suspense } from "react";
import { Roboto, Roboto_Slab } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { DemoBanner } from "@/components/DemoBanner";
import "./globals.css";

const display = Roboto_Slab({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Roboto({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "PHT Group · B2B Webshop",
    template: "%s · PHT Group",
  },
  description:
    "PHT Group B2B-Webshop — Personalhygiene, Betriebshygiene, Prozesstechnik und Service.",
  icons: {
    icon: "/brand/favicon.webp",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable} h-full`}>
      <body className="page-shell antialiased">
        <CartProvider>
          <DemoBanner />
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="page-main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
