import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AtomicLoader from "@/components/loading.module";  // ✅ Import AtomicLoader
import Navbar from "@/components/navbar.module";        // ✅ Import Navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bloggarithm",
  description: "A modern blogging platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AtomicLoader />  {/* ✅ Tambahkan Loader */}
        <Navbar />        {/* ✅ Tambahkan Navbar */}
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
