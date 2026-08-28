"use client";

import { useEffect, useState, type DragEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const STORAGE_KEY = "markdown-reader-content";

const MARKDOWN_EXTENSIONS = [".md", ".markdown"];

function isMarkdownFile(file: File) {
  return (
    file.type === "text/markdown" ||
    MARKDOWN_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
}

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");
  const [isDragging, setIsDragging] = useState(false);

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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative grid flex-1 grid-cols-1 gap-4 md:grid-cols-2"
    >
      <textarea
        value={markdown}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Paste or type your markdown here, or drop a .md file..."
        aria-label="Markdown input"
        className="min-h-[50vh] w-full resize-none rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <div className="prose prose-zinc min-h-[50vh] max-w-none rounded-lg border border-zinc-300 p-4 dark:prose-invert dark:border-zinc-700">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-400 bg-white/70 text-sm font-medium text-zinc-600 dark:border-zinc-500 dark:bg-zinc-950/70 dark:text-zinc-300">
          Drop your .md file to load it
        </div>
      )}
    </div>
  );
}
