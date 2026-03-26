/* eslint-disable @typescript-eslint/no-explicit-any */
/** Types minimalistes : sql.js n’expose pas de définitions TypeScript complètes via le paquet npm. */

export type SqlDb = any;

export type YearCount = { year: number; count: number };

export function queryNameSeries(
  db: SqlDb,
  prenom: string,
  sexe: "" | "1" | "2",
): YearCount[] {
  let sql =
    "SELECT annais, SUM(nombre) AS total FROM births WHERE preusuel = ? AND annais GLOB '[0-9][0-9][0-9][0-9]'";
  const params: (string | number)[] = [prenom];
  if (sexe !== "") {
    sql += " AND sexe = ?";
    params.push(parseInt(sexe, 10));
  }
  sql += " GROUP BY annais ORDER BY annais";

  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out: YearCount[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as { annais: string; total: number };
    out.push({ year: parseInt(String(row.annais), 10), count: Number(row.total) });
  }
  stmt.free();
  return out;
}

export function mergeChartRows(
  names: string[],
  series: Map<string, YearCount[]>,
): Record<string, string | number>[] {
  const yearSet = new Set<number>();
  for (const name of names) {
    for (const p of series.get(name) ?? []) yearSet.add(p.year);
  }
  const years = Array.from(yearSet).sort((a, b) => a - b);
  return years.map((year) => {
    const row: Record<string, string | number> = { year };
    for (const name of names) {
      const list = series.get(name) ?? [];
      row[name] = list.find((x) => x.year === year)?.count ?? 0;
    }
    return row;
  });
}

export function resolvePrenom(input: string, prenoms: string[]): string | null {
  const t = input.trim();
  if (!t) return null;
  const found = prenoms.find((p) => p.localeCompare(t, "fr", { sensitivity: "base" }) === 0);
  return found ?? null;
}
