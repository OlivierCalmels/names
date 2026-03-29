const FR = "fr-FR";

/**
 * Affiche un prénom INSEE (souvent en majuscules) avec une seule capitale initiale
 * par segment (trait d’union : Marie-Claire).
 */
export function displayPrenom(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  if (raw.startsWith("_")) return raw;

  return raw
    .split("-")
    .map((part) => {
      if (!part) return part;
      const lower = part.toLocaleLowerCase(FR);
      return lower.charAt(0).toLocaleUpperCase(FR) + lower.slice(1);
    })
    .join("-");
}
