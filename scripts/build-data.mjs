/**
 * Lit data/dpt2022.csv (INSEE) et produit :
 * - public/data/births (SQLite, sans extension — évite le fallback SPA du dev server sur « . »)
 * - public/data/prenoms (JSON, sans extension)
 * - public/data/depts (JSON, sans extension)
 * - public/data/records (JSON — agrégats nationaux : records « stock » 70 ans + cumul naissances)
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

const YEAR_RE = /^\d{4}$/;
const LIFE_STOCK = 70;

/** @param {Record<number, Record<number, Map<string, number>>>} national */
function bestTotals(national, sexe) {
  const totals = new Map();
  const byYear = national[sexe] || {};
  for (const y of Object.keys(byYear)) {
    const m = byYear[y];
    for (const [p, c] of m) {
      totals.set(p, (totals.get(p) || 0) + c);
    }
  }
  let bestP = null;
  let best = -1;
  for (const [p, t] of totals) {
    if (t > best || (t === best && bestP != null && p.localeCompare(bestP) < 0)) {
      best = t;
      bestP = p;
    }
  }
  return { preusuel: bestP, total: Math.max(0, best) };
}

/** @param {Record<number, Record<number, Map<string, number>>>} national */
function stockChampionsByYear(national, sexe, yMin, yMax) {
  const window = new Map();
  const out = [];
  const byYear = national[sexe] || {};
  for (let T = yMin; T <= yMax; T++) {
    const addMap = byYear[T];
    if (addMap) {
      for (const [p, n] of addMap) {
        window.set(p, (window.get(p) || 0) + n);
      }
    }
    const rem = T - LIFE_STOCK;
    if (rem >= yMin && byYear[rem]) {
      for (const [p, n] of byYear[rem]) {
        const v = (window.get(p) || 0) - n;
        if (v <= 0) window.delete(p);
        else window.set(p, v);
      }
    }
    let bestP = null;
    let bestV = -1;
    for (const [p, v] of window) {
      if (v > bestV || (v === bestV && bestP != null && p.localeCompare(bestP) < 0)) {
        bestV = v;
        bestP = p;
      }
    }
    out.push({
      year: T,
      preusuel: bestV < 0 ? null : bestP,
      stock: Math.max(0, bestV),
    });
  }
  return out;
}

/** @param {Record<number, Record<number, Map<string, number>>>} national */
function writeRecordsFromNational(national, outDir) {
  const allYears = new Set();
  for (const s of [1, 2]) {
    const byYear = national[s] || {};
    for (const k of Object.keys(byYear)) allYears.add(parseInt(k, 10));
  }
  if (allYears.size === 0) {
    console.warn("Aucune année pour l’agrégat national ; fichier records ignoré.");
    return;
  }
  const yMin = Math.min(...allYears);
  const yMax = Math.max(...allYears);
  const boys = stockChampionsByYear(national, 1, yMin, yMax);
  const girls = stockChampionsByYear(national, 2, yMin, yMax);
  const stockChampionByYear = boys.map((b, i) => ({
    year: b.year,
    "1": { preusuel: b.preusuel, stock: b.stock },
    "2": { preusuel: girls[i].preusuel, stock: girls[i].stock },
  }));
  const payload = {
    lifeYears: LIFE_STOCK,
    yearMin: yMin,
    yearMax: yMax,
    description:
      "France entière (tous départements additionnés). À l’année T, le « stock » d’un prénom est la somme des naissances de ce prénom et du même sexe sur les 70 années T-69 … T (personnes supposées vivantes 70 ans). Les prénoms agrégés (_PRENOMS_RARES) sont exclus.",
    mostGivenSince1900: {
      "1": bestTotals(national, 1),
      "2": bestTotals(national, 2),
    },
    stockChampionByYear,
  };
  writeFileSync(path.join(outDir, "records"), JSON.stringify(payload), "utf8");
  console.log(`OK — records nationaux → ${path.join(outDir, "records")}`);
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
  /** @type {Record<number, Record<number, Map<string, number>>>} */
  const national = { 1: {}, 2: {} };

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

    if (YEAR_RE.test(annais) && preusuel !== "_PRENOMS_RARES") {
      const y = parseInt(annais, 10);
      if (!national[sexe][y]) national[sexe][y] = new Map();
      const nm = national[sexe][y];
      nm.set(preusuel, (nm.get(preusuel) || 0) + nombre);
    }

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

  writeRecordsFromNational(national, OUT_DIR);

  console.log(
    `OK — ${lineNo - 1} lignes lues, ${prenomsSorted.length} prénoms, ${deptsSorted.length} codes département.`,
  );
  console.log(`SQLite : ${DB_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
