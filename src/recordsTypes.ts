/** Même forme que public/data/records (JSON généré par scripts/build-data.mjs). */

export type RecordsPayload = {
  lifeYears: number;
  yearMin: number;
  yearMax: number;
  /** Méthodo (fichier JSON produit par le build). */
  description?: string;
  mostGivenSince1900: {
    "1": { preusuel: string; total: number };
    "2": { preusuel: string; total: number };
  };
  stockChampionByYear: Array<{
    year: number;
    "1": { preusuel: string | null; stock: number };
    "2": { preusuel: string | null; stock: number };
  }>;
};
