/* ============================================================
   kit/prerender.mjs — write the kit's topbar, header and footer
   markup, plus the sitewide Person JSON-LD, into every page's HTML.

   Why: kit.js builds the nav, footer and Person schema in the
   browser. Crawlers that don't run JavaScript (most AI crawlers,
   and Google on its first pass) otherwise see empty mount divs and
   no schema. kit.js still renders them at runtime, so the live page
   always matches the current site.config.js; this script only makes
   the same markup visible in the raw HTML.

   Run from the repo root after changing site/site.config.js or
   adding a page (no dependencies):
     node kit/prerender.mjs

   It is idempotent: output lives between <!-- KIT:PRERENDER --> and
   <!-- KIT:SCHEMA --> markers and is replaced on every run. Pages
   with a hand-written <script data-kit-schema="person"> keep it.
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".git", ".vercel", "preview", "templates", "partials", "api", "assets", "kit", "site"]);

/* --- load site.config.js + kit.js in a stub browser ---------------- */
const noop = () => {};
globalThis.window = { __KIT_PRERENDER: true };
globalThis.document = {
  addEventListener: noop, readyState: "loading", head: { appendChild: noop },
  createElement: () => ({ setAttribute: noop }), querySelector: () => null,
  querySelectorAll: () => [], getElementById: () => null, documentElement: { setAttribute: noop },
};
(0, eval)(readFileSync(join(root, "site/site.config.js"), "utf8"));
const S = window.SITE || {};
const ORIGIN = `https://${S.domain || "example.com"}`;
globalThis.location = { pathname: "/", hostname: S.domain || "example.com", href: `${ORIGIN}/` };
(0, eval)(readFileSync(join(root, "kit/kit.js"), "utf8"));
const K = window.__kitBuild;
if (!K) { console.error("prerender: kit.js did not expose window.__kitBuild (needs kit 1.8.0+)."); process.exit(1); }

const chrome = { "topbar-mount": K.topbar(), "header-mount": K.nav(), "footer-mount": K.footer() };

/* --- walk pages -------------------------------------------------- */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!SKIP_DIRS.has(name)) walk(p, out); }
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function pageUrl(html, rel) {
  const c = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (c) return c[1];
  let path = "/" + rel.split(sep).join("/");
  path = path.replace(/index\.html$/, "").replace(/\.html$/, "");
  return ORIGIN + (path || "/");
}

let chromeCount = 0, schemaCount = 0, skippedSchema = [];
for (const file of walk(root)) {
  const rel = relative(root, file);
  const before = readFileSync(file, "utf8");
  let html = before;

  // 1. nav / topbar / footer markup into the mount divs
  for (const [id, markup] of Object.entries(chrome)) {
    const re = new RegExp(`(<div id="${id}">)(?:<!-- KIT:PRERENDER -->[\\s\\S]*?<!-- /KIT:PRERENDER -->)?(</div>)`);
    html = html.replace(re, (_, open, close) => `${open}<!-- KIT:PRERENDER -->${markup}<!-- /KIT:PRERENDER -->${close}`);
  }

  // 2. Person / ProfilePage (+ WebSite on the homepage) JSON-LD, kit pages only
  if (/\/kit\/kit\.js/.test(html) && html.includes("</head>")) {
    html = html.replace(/\n?[ \t]*<!-- KIT:SCHEMA -->[\s\S]*?<!-- \/KIT:SCHEMA -->/, "");
    if (html.includes('data-kit-schema="person"')) {
      skippedSchema.push(rel); // hand-written variant (e.g. /about) wins
    } else {
      const graph = K.personGraph(pageUrl(html, rel), rel === "index.html");
      if (graph) {
        const json = JSON.stringify(graph).replace(/</g, "\\u003c");
        html = html.replace("</head>",
          `  <!-- KIT:SCHEMA -->\n  <script type="application/ld+json" data-kit-schema="person">${json}</script>\n  <!-- /KIT:SCHEMA -->\n</head>`);
        schemaCount++;
      }
    }
  }

  if (html !== before) { writeFileSync(file, html); }
  if (/<!-- KIT:PRERENDER -->/.test(html)) chromeCount++;
}

console.log(`prerender: nav/footer in ${chromeCount} page(s), Person schema in ${schemaCount} page(s)` +
  (skippedSchema.length ? `; kept hand-written schema in ${skippedSchema.join(", ")}` : "") + ".");
