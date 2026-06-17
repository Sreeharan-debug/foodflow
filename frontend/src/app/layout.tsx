import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/providers/theme-provider";
import QueryProvider from "@/providers/query-provider";
import AuthProvider from "@/providers/auth-provider";
import SocketProvider from "@/providers/socket-provider";
import CartProvider from "@/providers/cart-provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FOODFLOW — Premium Real-Time Food Ordering Platform",
  description: "Experience gourmet food deliveries at your fingertips, powered by real-time WebSockets tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" style={{ colorScheme: 'dark' }}>
      <body className={`${outfit.variable} ${inter.variable} min-h-full flex flex-col font-sans`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <SocketProvider>
                <CartProvider>
                  {children}
                </CartProvider>
              </SocketProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
