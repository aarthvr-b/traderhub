import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "traderhub",
  description: "A unified trading hub for trade planning and price alerts.",
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
