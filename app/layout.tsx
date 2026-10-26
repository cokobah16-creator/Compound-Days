import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compound Days — One shared household",
  description: "Two phones, one home in Palm Court. A cozy Nigerian cooperative life game.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
