/**
 * Agrège le fichier INSEE départemental (sexe;preusuel;annais;dpt;nombre)
 * en fichier national (sexe;preusuel;annais;nombre) en sommant les effectifs
 * par département. Réduit fortement la taille (~100× moins de lignes).
 *
 * Entrée par défaut : data/dpt2022.csv
 * Sortie : data/national_prenoms.csv
 *
 * Variables d’env optionnelles : INSEE_DPT_CSV, NATIONAL_CSV_OUT
 */

import { createReadStream, writeFileSync, existsSync, statSync } from "fs";
import { createInterface } from "readline";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const INPUT = process.env.INSEE_DPT_CSV || path.join(ROOT, "data", "dpt2022.csv");
const OUTPUT = process.env.NATIONAL_CSV_OUT || path.join(ROOT, "data", "national_prenoms.csv");

/** Séparateur improbable dans un prénom INSEE */
const SEP = "\x1f";

function keyOf(sexe, preusuel, annais) {
  return `${sexe}${SEP}${preusuel}${SEP}${annais}`;
}

async function main() {
  if (!existsSync(INPUT)) {
    console.error(`Fichier introuvable : ${INPUT}`);
    process.exit(1);
  }

  const agg = new Map();
  const rl = createInterface({
    input: createReadStream(INPUT, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let lineNo = 0;
  for await (const line of rl) {
    lineNo += 1;
    if (lineNo === 1) continue;
    const parts = line.split(";");
    if (parts.length < 5) continue;
    const [sexeStr, preusuel, annais, , nombreStr] = parts;
    const nombre = parseInt(nombreStr, 10);
    if (Number.isNaN(parseInt(sexeStr, 10)) || Number.isNaN(nombre) || !preusuel) continue;

    const k = keyOf(sexeStr, preusuel, annais);
    agg.set(k, (agg.get(k) || 0) + nombre);
  }

  const rows = [...agg.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr", { sensitivity: "base" }))
    .map(([k, nombre]) => {
      const [sexe, preusuel, annais] = k.split(SEP);
      return `${sexe};${preusuel};${annais};${nombre}`;
    });

  const header = "sexe;preusuel;annais;nombre\n";
  writeFileSync(OUTPUT, header + rows.join("\n"), "utf8");

  const inSize = statSync(INPUT).size;
  const outSize = statSync(OUTPUT).size;

  console.log(
    `OK — ${lineNo - 1} lignes lues → ${agg.size} lignes nationales (${(outSize / (1024 * 1024)).toFixed(2)} Mo, était ${(inSize / (1024 * 1024)).toFixed(2)} Mo)`,
  );
  console.log(`Écrit : ${OUTPUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
