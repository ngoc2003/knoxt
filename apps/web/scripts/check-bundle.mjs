import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const assetsDir = new URL("../dist/assets/", import.meta.url);
const indexHtml = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const limits = {
  entry: 220 * 1024,
  chunk: 250 * 1024,
};

const files = readdirSync(assetsDir)
  .filter((file) => file.endsWith(".js"))
  .map((file) => {
    const path = join(assetsDir.pathname, file);
    return {
      file,
      raw: statSync(path).size,
      gzip: gzipSync(readFileSync(path)).byteLength,
    };
  })
  .sort((a, b) => b.gzip - a.gzip);

const entryFile = indexHtml.match(
  /<script[^>]+src="\/assets\/([^"]+\.js)"/,
)?.[1];
const entry = files.find(({ file }) => file === entryFile);
const failures = [];

if (!entry) failures.push("Could not find the initial index JavaScript chunk.");
if (entry && entry.gzip > limits.entry) {
  failures.push(
    `Initial chunk is ${format(entry.gzip)} gzip; budget is ${format(limits.entry)}.`,
  );
}

for (const file of files) {
  if (file.gzip > limits.chunk) {
    failures.push(
      `${file.file} is ${format(file.gzip)} gzip; chunk budget is ${format(limits.chunk)}.`,
    );
  }
}

console.table(
  files.map(({ file, raw, gzip }) => ({
    file,
    raw: format(raw),
    gzip: format(gzip),
  })),
);

if (failures.length > 0) {
  console.error(`\nBundle budget failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
}

function format(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}
