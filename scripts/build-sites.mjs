import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(projectRoot, "index.html"), "utf8");
const outputDir = join(projectRoot, "dist", "server");
const hostingDir = join(projectRoot, "dist", ".openai");

mkdirSync(outputDir, { recursive: true });
mkdirSync(hostingDir, { recursive: true });

const worker = `const HTML = ${JSON.stringify(html)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
    if (url.pathname !== "/" && url.pathname !== "/index.html") {
      return new Response("Not Found", { status: 404 });
    }
    return new Response(HTML, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=60",
        "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'none'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY"
      }
    });
  }
};
`;

writeFileSync(join(outputDir, "index.js"), worker, "utf8");
copyFileSync(join(projectRoot, ".openai", "hosting.json"), join(hostingDir, "hosting.json"));
console.log("Sites deployment bundle built.");
