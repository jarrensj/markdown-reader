export const THEME_STORAGE_KEY = "markdown-reader-theme";

export type Theme = "system" | "light" | "dark";

export const THEMES: { value: Theme; glyph: string; label: string }[] = [
  { value: "system", glyph: "◐", label: "auto" },
  { value: "light", glyph: "○", label: "light" },
  { value: "dark", glyph: "●", label: "dark" },
];

export function isTheme(value: string | null): value is Theme {
  return value === "system" || value === "light" || value === "dark";
}
