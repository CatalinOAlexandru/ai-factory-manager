import { existsSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const designTheme = resolve(root, "design/theme.tailwind.css");
export const designThemePresent = existsSync(designTheme);

/** Factory Design's @theme when present, else the PDF-based fallback. design/ is never edited. */
export function themeAliases() {
  return {
    "@pp-theme": designThemePresent ? designTheme : resolve(__dirname, "theme-fallback.css"),
    "@pp-base": resolve(__dirname, "base.css"),
  };
}

/** Copy the logo files named in brand.config.json into <publicDir>/brand/ under stable names. */
export function syncBrand(publicDir: string) {
  const cfg = JSON.parse(readFileSync(resolve(root, "brand.config.json"), "utf8")) as { files: Record<string, string> };
  const out = resolve(publicDir, "brand");
  mkdirSync(out, { recursive: true });
  for (const [name, rel] of Object.entries(cfg.files)) {
    const src = resolve(root, rel);
    if (existsSync(src)) copyFileSync(src, resolve(out, name));
  }
}
