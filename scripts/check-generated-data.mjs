/**
 * Vérifie que les sorties de build:data existent, ne sont pas vides,
 * et ne sont pas plus anciennes que data/national_prenoms.csv.
 *
 * Contourner le hook : git commit --no-verify
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSV = path.join(ROOT, "data", "national_prenoms.csv");

const OUTPUTS = [
  ["public/data/prenoms", "liste prénoms"],
  ["public/data/records", "agrégats records"],
  ["public/data/births_packed", "base SQLite gzip (births_packed)"],
  ["public/sqljs/sql-wasm.wasm", "WebAssembly sql.js"],
];

function main() {
  if (!fs.existsSync(CSV)) {
    console.error(`\n✖ Source CSV introuvable : ${path.relative(ROOT, CSV)}`);
    console.error("  → npm run aggregate:csv (depuis le fichier INSEE départemental)\n");
    process.exit(1);
  }

  const csvStat = fs.statSync(CSV);
  let errors = 0;

  for (const [rel, label] of OUTPUTS) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      console.error(`\n✖ Manquant : ${rel} (${label})`);
      console.error(`  → npm run build:data\n`);
      errors++;
      continue;
    }
    const st = fs.statSync(abs);
    if (st.size === 0) {
      console.error(`\n✖ Fichier vide : ${rel}`);
      console.error(`  → npm run build:data\n`);
      errors++;
      continue;
    }
    if (csvStat.mtimeMs > st.mtimeMs + 500) {
      console.error(`\n✖ ${rel} est plus ancien que le CSV (${label}).`);
      console.error(`  → npm run build:data\n`);
      errors++;
    }
  }

  if (errors > 0) {
    console.error(
      `Données générées : ${errors} problème(s). Corrigez puis recommitez (ou git commit --no-verify pour ignorer).\n`,
    );
    process.exit(1);
  }

  console.log("✓ Données générées présentes et à jour par rapport à data/national_prenoms.csv");
}

main();
