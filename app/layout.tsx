import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "markdown reader",
  description: "markdown reader",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        {children}
        <footer className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <a
            href="https://github.com/jarrensj/markdown-reader"
            className="underline"
          >
            This project is open source
          </a>
          . We don&apos;t store anything you paste — it stays in your
          browser&apos;s local storage.
        </footer>
      </body>
    </html>
  );
}
