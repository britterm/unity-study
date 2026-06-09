import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/render-handout.mjs <input.md> <output.html>");
  process.exit(1);
}

const md = readFileSync(inputPath, "utf8");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function tableToHtml(lines) {
  const rows = lines
    .filter((line, index) => index !== 1)
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => inlineMarkdown(cell.trim()))
    );

  const [head, ...body] = rows;
  const tableClass = head.length === 2 ? "table-two-col" : "table-multi-col";
  return [
    `<table class="${tableClass}">`,
    "<thead><tr>",
    ...head.map((cell) => `<th>${cell}</th>`),
    "</tr></thead>",
    "<tbody>",
    ...body.flatMap((row) => ["<tr>", ...row.map((cell) => `<td>${cell}</td>`), "</tr>"]),
    "</tbody>",
    "</table>"
  ].join("");
}

const html = [];
const lines = md.split(/\r?\n/);
let paragraph = [];
let list = [];

function flushParagraph() {
  if (!paragraph.length) return;
  html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  paragraph = [];
}

function flushList() {
  if (!list.length) return;
  html.push("<ul>");
  for (const item of list) html.push(`<li>${inlineMarkdown(item)}</li>`);
  html.push("</ul>");
  list = [];
}

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  const trimmed = line.trim();

  if (!trimmed) {
    flushParagraph();
    flushList();
    continue;
  }

  if (trimmed.startsWith("|")) {
    flushParagraph();
    flushList();
    const tableLines = [];
    while (i < lines.length && lines[i].trim().startsWith("|")) {
      tableLines.push(lines[i]);
      i += 1;
    }
    i -= 1;
    html.push(tableToHtml(tableLines));
    continue;
  }

  const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
  if (heading) {
    flushParagraph();
    flushList();
    const level = heading[1].length;
    html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
    continue;
  }

  const bullet = trimmed.match(/^-\s+(.+)$/);
  if (bullet) {
    flushParagraph();
    list.push(bullet[1]);
    continue;
  }

  paragraph.push(trimmed);
}

flushParagraph();
flushList();

const title = md.match(/^#\s+(.+)$/m)?.[1] ?? basename(inputPath);

writeFileSync(
  outputPath,
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        --ink: #17212b;
        --muted: #5b6673;
        --line: #d8dde4;
        --paper: #fbfaf7;
        --blue: #1f4e79;
        --gold: #a87822;
      }

      * {
        box-sizing: border-box;
      }

      body {
        background: var(--paper);
        color: var(--ink);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 10.5pt;
        line-height: 1.36;
        margin: 0;
      }

      main {
        margin: 0 auto;
        max-width: 11in;
        padding: 0.38in;
      }

      h1,
      h2,
      h3 {
        color: var(--ink);
        font-family: Georgia, "Times New Roman", serif;
        letter-spacing: 0;
        line-height: 1.1;
        margin: 0;
      }

      h1 {
        border-bottom: 3px solid var(--blue);
        font-size: 25pt;
        margin-bottom: 0.12in;
        padding-bottom: 0.08in;
      }

      h2 {
        break-after: avoid;
        break-before: page;
        color: var(--blue);
        font-size: 18pt;
        margin-top: 0.1in;
      }

      h2:first-of-type {
        break-before: auto;
      }

      h3 {
        break-after: avoid;
        color: var(--gold);
        font-size: 13pt;
        margin-top: 0.16in;
        text-transform: uppercase;
      }

      p {
        margin: 0.07in 0;
      }

      ul {
        margin: 0.07in 0 0.1in 0.22in;
        padding: 0;
      }

      li {
        margin: 0.03in 0;
      }

      code {
        background: #eef3f5;
        border: 1px solid var(--line);
        border-radius: 3px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.92em;
        padding: 0 0.04in;
      }

      table {
        border-collapse: collapse;
        break-inside: auto;
        font-size: 8.8pt;
        margin: 0.1in 0 0.18in;
        table-layout: fixed;
        width: 100%;
      }

      tr {
        break-inside: avoid;
      }

      th,
      td {
        border: 1px solid var(--line);
        padding: 0.07in;
        text-align: left;
        vertical-align: top;
      }

      th {
        background: #e9eff3;
        color: var(--blue);
        font-size: 9.2pt;
        font-weight: 800;
      }

      .table-two-col td:first-child,
      .table-two-col th:first-child {
        width: 31%;
      }

      .table-two-col td:last-child,
      .table-two-col th:last-child {
        width: 69%;
      }

      .table-multi-col {
        font-size: 8.3pt;
      }

      .table-multi-col th,
      .table-multi-col td {
        padding: 0.06in;
        width: auto;
      }

      .table-multi-col th:first-child,
      .table-multi-col td:first-child {
        width: 24%;
      }

      @page {
        margin: 0.3in;
        size: letter landscape;
      }

      @media print {
        body {
          background: white;
        }

        main {
          max-width: none;
          padding: 0;
        }

        a {
          color: inherit;
        }
      }
    </style>
  </head>
  <body>
    <main>
      ${html.join("\n")}
    </main>
  </body>
</html>
`,
  "utf8"
);
