"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const STORAGE_KEY = "markdown-reader-content";

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setMarkdown(saved);
    }
  }, []);

  const handleChange = (value: string) => {
    setMarkdown(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
      <textarea
        value={markdown}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Paste or type your markdown here..."
        aria-label="Markdown input"
        className="min-h-[50vh] w-full resize-none rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <div className="prose prose-zinc min-h-[50vh] max-w-none rounded-lg border border-zinc-300 p-4 dark:prose-invert dark:border-zinc-700">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
