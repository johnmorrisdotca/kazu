// Packs the package the way it is published (`npm pack`, npm and not pnpm),
// installs the tarball into an empty project, and uses it as somebody who
// installed it would: every entry in `exports` imported by ESM and loaded by
// `require`, and each command in `bin` run. A package whose `exports` name a
// file that is not in the tarball fails here, before it can be published.
// `pnpm test:package` builds first.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const windows = process.platform === "win32";
const scratch = mkdtempSync(join(tmpdir(), "kazu-package-"));

/** Run a command and hand back what it printed. On Windows, npm and the installed commands are .cmd files, which only a shell runs; node itself is run directly. */
function run(command, args, cwd, viaShell = false) {
  const shell = viaShell && windows;
  // A path is quoted for the shell; a bare name such as npm is left for the shell to find.
  const ran = spawnSync(shell && /[\\/]/.test(command) ? `"${command}"` : command, args, { cwd, encoding: "utf8", shell });
  if (ran.status !== 0) {
    console.error(`FAIL ${command} ${args.join(" ")}\n${ran.stdout}\n${ran.stderr}`);
    process.exit(1);
  }
  return ran.stdout;
}

// 1. Pack, with npm.
const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", scratch], root, true));
const tarball = join(scratch, packed[0].filename);
const inTarball = new Set(packed[0].files.map((file) => file.path));
console.log(`ok   npm pack: ${packed[0].filename}, ${packed[0].files.length} files`);

// 2. Everything package.json points at is in the tarball.
const pointed = [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.bin ?? {}), ...Object.values(pkg.exports).flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry)))];
for (const file of new Set(pointed)) {
  if (!inTarball.has(file.replace(/^\.\//, ""))) {
    console.error(`FAIL package.json points at ${file}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   every file package.json points at is in the tarball (${new Set(pointed).size})`);

for (const named of pkg.files) {
  if (![...inTarball].some((file) => file === named || file.startsWith(`${named}/`))) {
    console.error(`FAIL package.json's files names ${named}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   everything in package.json's files is in the tarball (${pkg.files.length})`);

// 3. Install it into an empty project.
const project = join(scratch, "project");
mkdirSync(project);
writeFileSync(join(project, "package.json"), JSON.stringify({ name: "scratch", private: true, version: "0.0.0" }));
run("npm", ["install", "--no-audit", "--no-fund", "--silent", tarball], project, true);
console.log("ok   npm install of the tarball");

// A puzzle as the built package in this checkout makes it: the installed one must make the same, and check it.
const local = await import(new URL("../dist/index.js", import.meta.url).href);
const made = local.generateKazu("sum-cages", 6, "medium", 42);

// 4. Every entry in `exports`, by ESM and by require.
const entries = Object.keys(pkg.exports).map((key) => (key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`));
writeFileSync(
  join(project, "esm.mjs"),
  `${entries.map((entry, i) => `import * as m${i} from ${JSON.stringify(entry)};`).join("\n")}
const all = [${entries.map((_, i) => `m${i}`).join(", ")}];
const names = ${JSON.stringify(entries)};
// An entry that only defines the tag on a page (the /define one) exports nothing, and is imported for its effect.
all.forEach((m, i) => { if (Object.keys(m).length === 0 && !names[i].endsWith("/define")) throw new Error(names[i] + " exports nothing"); });
const { generateKazu, checkKazu, countKazuSolutions, hintKazu, VERSION, generateShikaku, solveShikaku, checkShikaku } = m0;
const rectanglePuzzle = generateShikaku(7, 7, "medium", 42);
if (!checkShikaku(rectanglePuzzle, rectanglePuzzle.solution).ok || solveShikaku(rectanglePuzzle).count !== 1) throw new Error("installed Shikaku engine failed");
const made = generateKazu("sum-cages", 6, "medium", 42);
if (JSON.stringify(made) !== ${JSON.stringify(JSON.stringify(made))}) throw new Error("the installed package made " + JSON.stringify(made));
if (!checkKazu("sum-cages", 6, made.givens, made.solution).ok) throw new Error("the solution does not check");
if (countKazuSolutions("sum-cages", 6, made.givens) !== 1) throw new Error("the puzzle has not exactly one answer");
if (hintKazu("sum-cages", 6, made.givens, new Array(36).fill(0)) === null) throw new Error("no hint");
if (VERSION !== ${JSON.stringify(pkg.version)}) throw new Error("VERSION is " + VERSION);
const { drawKazu } = await import(${JSON.stringify(`${pkg.name}/draw`)});
const svg = drawKazu("sum-cages", 6, made.givens);
if (!svg.startsWith("<svg") || !svg.includes("kz-cage")) throw new Error("the drawing is " + String(svg).slice(0, 80));
console.log(names.join(" "));
`,
);
writeFileSync(
  join(project, "cjs.cjs"),
  `const names = ${JSON.stringify(entries)};
for (const name of names) { const m = require(name); if (Object.keys(m).length === 0 && !name.endsWith("/define")) throw new Error(name + " exports nothing"); }
const { generateKazu, checkKazu } = require(${JSON.stringify(pkg.name)});
const made = generateKazu("sum-cages", 6, "medium", 42);
if (!checkKazu("sum-cages", 6, made.givens, made.solution).ok) throw new Error("the solution does not check by require");
console.log(names.join(" "));
`,
);
console.log(`ok   import:  ${run(process.execPath, ["esm.mjs"], project).trim()}`);
console.log(`ok   require: ${run(process.execPath, ["cjs.cjs"], project).trim()}`);

// 5. Each command in `bin`, as installed.
for (const name of Object.keys(pkg.bin ?? {})) {
  const command = join(project, "node_modules", ".bin", windows ? `${name}.cmd` : name);
  const version = run(command, ["--version"], project, true).trim();
  if (version !== pkg.version) {
    console.error(`FAIL ${name} --version said ${version}`);
    process.exit(1);
  }
  const shuffled = run(command, ["--seed", "42", "--shuffle", "a", "b", "c"], project, true).replace(/\r\n/g, "\n");
  if (shuffled !== "c\na\nb\n") {
    console.error(`FAIL ${name} shuffled ${JSON.stringify(shuffled)}`);
    process.exit(1);
  }
  console.log(`ok   ${name} --version and a seeded shuffle, as installed`);
}

rmSync(scratch, { recursive: true, force: true });
console.log("the package installs and runs as published, on", process.platform, process.version);
