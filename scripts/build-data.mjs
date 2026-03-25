/**
 * Lit data/dpt2022.csv (INSEE) et produit :
 * - public/data/births (SQLite, sans extension — évite le fallback SPA du dev server sur « . »)
 * - public/data/prenoms (JSON, sans extension)
 * - public/data/depts (JSON, sans extension)
 * - copie node_modules/sql.js/dist/sql-wasm.wasm → public/sqljs/
 *
 * Utilise sql.js (sans addon natif) pour rester portable.
 */

import initSqlJs from "sql.js";
import {
  copyFileSync,
  createReadStream,
  mkdirSync,
  existsSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { createInterface } from "readline";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "data", "dpt2022.csv");
const OUT_DIR = path.join(ROOT, "public", "data");
const SQLJS_PUBLIC = path.join(ROOT, "public", "sqljs");
const DB_PATH = path.join(OUT_DIR, "births");
const LEGACY_DB_PATH = path.join(OUT_DIR, "births.sqlite");
const LEGACY_PRENOMS_JSON = path.join(OUT_DIR, "prenoms.json");
const LEGACY_DEPTS_JSON = path.join(OUT_DIR, "depts.json");
const WASM_SRC = path.join(ROOT, "node_modules", "sql.js", "dist", "sql-wasm.wasm");
const WASM_DST = path.join(SQLJS_PUBLIC, "sql-wasm.wasm");

function sortDeptCodes(a, b) {
  const norm = (x) => {
    if (/^\d+$/.test(x)) return [0, parseInt(x, 10)];
    if (/^\d+[AB]$/.test(x)) return [1, x];
    return [2, x];
  };
  const [ta, va] = norm(a);
  const [tb, vb] = norm(b);
  if (ta !== tb) return ta - tb;
  if (typeof va === "number" && typeof vb === "number") return va - vb;
  return String(va).localeCompare(String(vb), "fr");
}

function locFile(file) {
  return path.join(path.dirname(WASM_SRC), file);
}

async function main() {
  if (!existsSync(CSV_PATH)) {
    console.error(`Fichier CSV introuvable : ${CSV_PATH}`);
    process.exit(1);
  }
  if (!existsSync(WASM_SRC)) {
    console.error(
      `sql-wasm.wasm introuvable (${WASM_SRC}). Lancez npm install (dépendance sql.js).`,
    );
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(SQLJS_PUBLIC, { recursive: true });
  if (existsSync(LEGACY_DB_PATH)) unlinkSync(LEGACY_DB_PATH);
  if (existsSync(LEGACY_PRENOMS_JSON)) unlinkSync(LEGACY_PRENOMS_JSON);
  if (existsSync(LEGACY_DEPTS_JSON)) unlinkSync(LEGACY_DEPTS_JSON);
  copyFileSync(WASM_SRC, WASM_DST);

  const SQL = await initSqlJs({ locateFile: locFile });
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE births (
      sexe INTEGER NOT NULL,
      preusuel TEXT NOT NULL,
      annais TEXT NOT NULL,
      dpt TEXT NOT NULL,
      nombre INTEGER NOT NULL
    );
  `);

  const prenoms = new Set();
  const depts = new Set();

  const rl = createInterface({
    input: createReadStream(CSV_PATH, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let lineNo = 0;
  let batch = [];
  const BATCH_SIZE = 5000;

  const flush = () => {
    if (batch.length === 0) return;
    db.run("BEGIN");
    const stmt = db.prepare(
      "INSERT INTO births (sexe, preusuel, annais, dpt, nombre) VALUES (?, ?, ?, ?, ?)",
    );
    for (const row of batch) stmt.run(row);
    stmt.free();
    db.run("COMMIT");
    batch = [];
  };

  for await (const line of rl) {
    lineNo += 1;
    if (lineNo === 1) continue;
    const parts = line.split(";");
    if (parts.length < 5) continue;
    const [sexeStr, preusuel, annais, dpt, nombreStr] = parts;
    const sexe = parseInt(sexeStr, 10);
    const nombre = parseInt(nombreStr, 10);
    if (Number.isNaN(sexe) || Number.isNaN(nombre)) continue;

    if (preusuel && preusuel !== "_PRENOMS_RARES") prenoms.add(preusuel);
    if (dpt) depts.add(dpt);

    batch.push([sexe, preusuel, annais, dpt, nombre]);
    if (batch.length >= BATCH_SIZE) flush();
  }

  flush();

  db.run("CREATE INDEX idx_births_preusuel ON births(preusuel)");

  const binary = db.export();
  writeFileSync(DB_PATH, Buffer.from(binary));
  db.close();

  const prenomsSorted = [...prenoms].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
  const deptsSorted = [...depts].sort(sortDeptCodes);

  writeFileSync(path.join(OUT_DIR, "prenoms"), JSON.stringify(prenomsSorted), "utf8");
  writeFileSync(path.join(OUT_DIR, "depts"), JSON.stringify(deptsSorted), "utf8");

  console.log(
    `OK — ${lineNo - 1} lignes lues, ${prenomsSorted.length} prénoms, ${deptsSorted.length} codes département.`,
  );
  console.log(`SQLite : ${DB_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
