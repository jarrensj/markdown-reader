import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { THEME_STORAGE_KEY } from "./theme";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "markdown reader",
  description: "markdown reader for devs",
};

// Runs before first paint so a saved light/dark choice never flashes the other
// theme. "system" leaves data-theme unset and falls back to prefers-color-scheme.
const themeScript = `try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={ibmPlexMono.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-bg font-mono text-fg">
        {children}
        <footer className="flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-0.5 border-t border-rule px-[var(--gutter)] py-[7px] text-xs leading-4 text-muted">
          <a
            href="https://github.com/jarrensj/markdown-reader"
            className="underline [text-underline-offset:3px] transition-colors duration-[120ms] hover:text-fg"
          >
            this project is open source ↗
          </a>
          <span>
            we don&apos;t store anything you paste — it stays in your
            browser&apos;s local storage
          </span>
        </footer>
      </body>
    </html>
  );
}
