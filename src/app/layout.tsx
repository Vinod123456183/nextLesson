import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "nextLesson — Learn from real experiences",
    template: "%s — nextLesson",
  },
  description:
    "A community where people share real lessons, tips, and mistakes to help others grow.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "nextLesson",
    description:
      "Learn from real experiences — lessons, tips & mistakes shared by real people.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}
      >
        <Providers>
          <Navbar />
          <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: { fontSize: "14px", borderRadius: "10px" },
              success: { iconTheme: { primary: "#3b6ef5", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
