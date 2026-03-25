import initSqlJs from "sql.js";

/** Même version que la dépendance npm `sql.js` (mettre à jour si le paquet change). */
export const SQLJS_PACKAGE_VERSION = "1.14.1";

const WASM_MAGIC = new Uint8Array([0x00, 0x61, 0x73, 0x6d]);

function publicBase(publicUrl: string): string {
  return publicUrl.replace(/\/$/, "");
}

function startsWithBytes(buf: ArrayBuffer, prefix: Uint8Array): boolean {
  if (buf.byteLength < prefix.length) return false;
  const u = new Uint8Array(buf);
  return prefix.every((b, i) => u[i] === b);
}

export function isLikelyWasm(buf: ArrayBuffer): boolean {
  return startsWithBytes(buf, WASM_MAGIC);
}

export function isLikelySqliteDb(buf: ArrayBuffer): boolean {
  if (buf.byteLength < 15) return false;
  const hdr = new TextDecoder().decode(new Uint8Array(buf, 0, 15));
  return hdr === "SQLite format 3";
}

export function isLikelyHtmlDocument(buf: ArrayBuffer): boolean {
  if (buf.byteLength < 4) return false;
  const u = new Uint8Array(buf, 0, 4);
  return u[0] === 0x3c && u[1] === 0x21 && u[2] === 0x44 && u[3] === 0x4f;
}

/**
 * Charge le wasm sql.js : fichier local d’abord, puis CDN si la réponse n’est pas du WASM
 * (typique du serveur de dev CRA avec « history fallback » sur les URL contenant un point).
 */
export async function fetchSqlWasmBinary(publicUrl: string): Promise<ArrayBuffer> {
  const base = publicBase(publicUrl);
  const localUrl = `${base}/sqljs/sql-wasm.wasm`;
  try {
    const res = await fetch(localUrl);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      if (isLikelyWasm(buf)) return buf;
    }
  } catch {
    /* repli CDN */
  }
  const cdnUrl = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQLJS_PACKAGE_VERSION}/dist/sql-wasm.wasm`;
  const cdn = await fetch(cdnUrl);
  if (!cdn.ok) {
    throw new Error(
      `Impossible de charger le moteur sql.js (réponse HTTP ${cdn.status} depuis le CDN). Vérifiez la connexion.`,
    );
  }
  const buf = await cdn.arrayBuffer();
  if (!isLikelyWasm(buf)) {
    throw new Error("Réponse inattendue lors du chargement de sql.js (pas de WASM).");
  }
  return buf;
}

export async function initSqlFromWasm(publicUrl: string) {
  const wasmBinary = await fetchSqlWasmBinary(publicUrl);
  return initSqlJs({ wasmBinary });
}

/** Fichier sans extension pour éviter le fallback SPA du webpack-dev-server sur les chemins avec « . ». */
export async function fetchBirthsDatabase(publicUrl: string): Promise<ArrayBuffer> {
  const base = publicBase(publicUrl);
  const url = `${base}/data/births`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Base des prénoms introuvable (${res.status}). Exécutez npm run build:data (Node 18+).`,
    );
  }
  const buf = await res.arrayBuffer();
  if (isLikelyHtmlDocument(buf)) {
    throw new Error(
      "La base a renvoyé du HTML au lieu du fichier SQLite (souvent un « fallback » en développement). Rechargez après npm run build:data ; le fichier doit être public/data/births.",
    );
  }
  if (!isLikelySqliteDb(buf)) {
    throw new Error(
      "Le fichier public/data/births n’est pas une base SQLite valide. Régénérez-le avec npm run build:data.",
    );
  }
  return buf;
}
