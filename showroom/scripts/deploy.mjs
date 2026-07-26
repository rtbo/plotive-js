import ghpages from "gh-pages";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");

console.log(`Publishing ${distDir} to GitHub Pages...`);

ghpages.publish(
  distDir,
  {
    branch: "gh-pages",
    repo: "https://github.com/rtbo/plotive.git",
  },
  (err) => {
    if (err) {
      console.error("Error publishing to GitHub Pages:", err);
    }
  },
);
