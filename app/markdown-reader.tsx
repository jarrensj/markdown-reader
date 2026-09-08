"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type DragEvent,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { isTheme, THEME_STORAGE_KEY, THEMES, type Theme } from "./theme";

const STORAGE_KEY = "markdown-reader-content";

const MARKDOWN_EXTENSIONS = [".md", ".markdown"];

const LANGUAGE_PREFIX = "language-";

type Tab = "write" | "preview";

const TABS: Tab[] = ["write", "preview"];

function isMarkdownFile(file: File) {
  return (
    file.type === "text/markdown" ||
    MARKDOWN_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
}

// Hang the fenced block's language off the <pre> so CSS can render it as the
// tag in the corner without it becoming part of the copyable text.
const components: Components = {
  pre({ node, children, ...props }) {
    let lang: string | undefined;
    for (const child of node?.children ?? []) {
      if (child.type !== "element" || child.tagName !== "code") continue;
      const classes = child.properties?.className;
      if (!Array.isArray(classes)) continue;
      lang = classes
        .map(String)
        .find((name) => name.startsWith(LANGUAGE_PREFIX))
        ?.slice(LANGUAGE_PREFIX.length);
    }
    return (
      <pre data-lang={lang} {...props}>
        {children}
      </pre>
    );
  },
};

const themeListeners = new Set<() => void>();

function readTheme(): Theme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(saved) ? saved : "system";
}

function writeTheme(theme: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  // "system" leaves data-theme off so prefers-color-scheme keeps tracking the
  // OS live. The inline script in the layout applies the saved value on load.
  if (theme === "system") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }
  themeListeners.forEach((listener) => listener());
}

function subscribeToTheme(onChange: () => void) {
  themeListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    themeListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readTheme,
    () => "system" as Theme,
  );

  const cycleTheme = () => {
    const index = THEMES.findIndex((option) => option.value === theme);
    writeTheme(THEMES[(index + 1) % THEMES.length].value);
  };

  return { theme, cycleTheme };
}

export default function MarkdownReader() {
  const [markdown, setMarkdown] = useState("");
  const [tab, setTab] = useState<Tab>("write");
  const [isDragging, setIsDragging] = useState(false);
  const { theme, cycleTheme } = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setMarkdown(saved);
      if (saved.trim() !== "") {
        setTab("preview");
      }
    }
  }, []);

  const handleChange = (value: string) => {
    setMarkdown(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Ignore drags that just move between the drop zone's own children.
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || !isMarkdownFile(file)) {
      return;
    }

    file.text().then(handleChange);
  };

  const activeTheme =
    THEMES.find((option) => option.value === theme) ?? THEMES[0];
  const showEmpty = tab === "preview" && markdown.trim() === "";

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-1 flex-col"
    >
      <header className="flex h-11 items-start border-b border-rule px-[var(--gutter)]">
        <h1 className="flex h-[43px] items-center gap-2 whitespace-nowrap text-[13px] font-medium leading-5">
          <span className="text-accent">$</span>markdown reader
        </h1>
        <div role="tablist" className="ml-auto flex gap-5">
          {TABS.map((name) => {
            const selected = tab === name;
            return (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(name)}
                className={`flex h-11 items-center border-b px-0.5 text-[13px] leading-5 transition-colors duration-[120ms] ${
                  selected
                    ? "cursor-default border-accent text-fg"
                    : "border-transparent text-muted hover:text-fg"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
        <span
          aria-hidden
          className="mx-[clamp(12px,1.6vw,20px)] h-4 w-px self-center bg-rule"
        />
        <button
          type="button"
          onClick={cycleTheme}
          aria-label="cycle theme"
          title={`theme: ${activeTheme.label}`}
          className="flex h-[43px] items-center gap-2 whitespace-nowrap px-0.5 text-[13px] leading-5 text-muted transition-colors duration-[120ms] hover:text-fg"
        >
          <span aria-hidden>{activeTheme.glyph}</span>
          {activeTheme.label}
        </button>
      </header>

      <div className="relative flex flex-1 flex-col">
        {tab === "write" && (
          <textarea
            value={markdown}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="paste or type your markdown here, or drop a .md file…"
            aria-label="Markdown input"
            spellCheck={false}
            className="min-h-[400px] w-full flex-1 resize-none border-0 bg-transparent px-[var(--gutter)] py-6 text-sm leading-6 text-fg caret-accent outline-none"
          />
        )}

        {tab === "preview" &&
          (showEmpty ? (
            <div className="flex-1 px-[var(--gutter)] pb-16 pt-8">
              <p className="text-[13px] leading-5 text-muted">
                <span className="text-hint">{"// "}</span>nothing to preview yet
                — switch to write, or drop a .md file anywhere
              </p>
            </div>
          ) : (
            <div className="flex-1 px-[var(--gutter)] pb-16 pt-8">
              <div className="md">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={components}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          ))}

        {isDragging && (
          <div className="pointer-events-none absolute inset-2 flex items-center justify-center gap-2 rounded-[2px] border border-dashed border-accent bg-overlay text-[13px] leading-5 text-fg">
            <span className="text-accent">$</span>
            drop your .md file to load it
          </div>
        )}
      </div>
    </div>
  );
}
