import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const appRoot = path.join(projectRoot, "app", "(public)");
const candidates = [];

function collectFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectFiles(fullPath);
      continue;
    }

    if (entry.name === "page.tsx" || entry.name === "layout.tsx") {
      candidates.push(fullPath);
    }
  }
}

if (!fs.existsSync(appRoot)) {
  console.error(`Missing public app directory: ${appRoot}`);
  process.exit(1);
}

collectFiles(appRoot);

const violations = candidates.filter((filePath) => {
  const content = fs.readFileSync(filePath, "utf8").trimStart();
  return (
    content.startsWith('"use client"') ||
    content.startsWith("'use client'")
  );
});

if (violations.length > 0) {
  console.error("Public App Router boundaries were violated:");
  for (const violation of violations) {
    console.error(` - ${path.relative(projectRoot, violation)}`);
  }
  process.exit(1);
}

console.log(`Checked ${candidates.length} public route files. No client boundary violations found.`);
