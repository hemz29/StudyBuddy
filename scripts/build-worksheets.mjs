// Generates public/worksheets/<id>.pdf from the print pages, using headless Chromium so Kannada
// conjunct letters (ottakshara) render exactly as in the browser.
// Usage: start the app (npm run dev), then: node scripts/build-worksheets.mjs [baseUrl]
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3000";
const executablePath = process.env.CHROMIUM_PATH ?? undefined;

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();
const ids = await (await fetch(`${base}/api/worksheets`)).json();
await mkdir("public/worksheets", { recursive: true });
for (const id of ids) {
  await page.goto(`${base}/print/worksheet/${id}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: `public/worksheets/${id}.pdf`, format: "A4", printBackground: false, preferCSSPageSize: true });
  console.log(`public/worksheets/${id}.pdf`);
}
await browser.close();
