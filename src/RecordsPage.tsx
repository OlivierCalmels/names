import { useEffect, useState } from "react";
import "./App.css";
import { displayPrenom } from "./prenomDisplay";
import type { RecordsPayload } from "./recordsTypes";

const PUBLIC_URL = process.env.PUBLIC_URL ?? "";

export default function RecordsPage() {
  const [data, setData] = useState<RecordsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const base = PUBLIC_URL.replace(/\/$/, "");
        const res = await fetch(`${base}/data/records`);
        if (!res.ok) throw new Error(`Fichier records introuvable (${res.status}). Lancez npm run build:data.`);
        const json = (await res.json()) as RecordsPayload;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <p className="eyebrow">
          <span className="eyebrow-inner">Open data INSEE</span>
          <span className="eyebrow-sep" aria-hidden="true" />
          <span>Agrégat national · national_prenoms.csv</span>
        </p>
        <h1 className="title">Records & portrait « stock » des prénoms</h1>
        <p className="lead">
          Estimation du <strong>nombre de personnes portant un prénom</strong> à une date donnée : on
          suppose une espérance de vie de <strong>{data?.lifeYears ?? 70} ans</strong>, et on additionne
          les naissances du même prénom et du même sexe sur la fenêtre glissante des{" "}
          {data?.lifeYears ?? 70} dernières années (France entière, sans zoom département). Les totaux
          since {data?.yearMin ?? "…"} comparent les <strong>naissances cumulées</strong> sur toute la
          période couverte par le fichier.
        </p>
      </header>

      {error && (
        <div className="banner banner--error" role="alert">
          <strong>Erreur.</strong> {error}
        </div>
      )}

      {loading && <p className="status">Chargement des records…</p>}

      {data && !loading && (
        <>
          <section className="records-cards" aria-label="Records cumulés">
            <article className="records-card">
              <h2 className="records-card-title">Garçons — naissances cumulées</h2>
              <p className="records-card-name">
                {displayPrenom(data.mostGivenSince1900["1"].preusuel)}
              </p>
              <p className="records-card-metric">
                {data.mostGivenSince1900["1"].total.toLocaleString("fr-FR")} naissances ({data.yearMin}–
                {data.yearMax})
              </p>
            </article>
            <article className="records-card">
              <h2 className="records-card-title">Filles — naissances cumulées</h2>
              <p className="records-card-name">
                {displayPrenom(data.mostGivenSince1900["2"].preusuel)}
              </p>
              <p className="records-card-metric">
                {data.mostGivenSince1900["2"].total.toLocaleString("fr-FR")} naissances ({data.yearMin}–
                {data.yearMax})
              </p>
            </article>
          </section>

          <section className="records-table-section" aria-label="Champions du stock par année">
            <h2 className="records-section-title">Prénom le plus « porté » par année (stock {data.lifeYears} ans)</h2>
            <p className="records-section-lead">
              Pour chaque année, prénom de sexe donné avec le plus grand stock estimé (somme des naissances
              sur les {data.lifeYears} années se terminant cette année-là).
            </p>
            <div className="records-table-wrap">
              <table className="records-table">
                <thead>
                  <tr>
                    <th scope="col">Année</th>
                    <th scope="col">Garçons</th>
                    <th scope="col">Stock garçons</th>
                    <th scope="col">Filles</th>
                    <th scope="col">Stock filles</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.stockChampionByYear].reverse().map((row) => (
                    <tr key={row.year}>
                      <td>{row.year}</td>
                      <td>{displayPrenom(row["1"].preusuel)}</td>
                      <td className="records-table-num">{row["1"].stock.toLocaleString("fr-FR")}</td>
                      <td>{displayPrenom(row["2"].preusuel)}</td>
                      <td className="records-table-num">{row["2"].stock.toLocaleString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <footer className="footer">
        <a href="https://www.insee.fr/" rel="noreferrer noopener" target="_blank">
          INSEE
        </a>
        {" · "}
        <a
          href="https://www.data.gouv.fr/fr/datasets/fichier-des-prenoms-edition-2024/"
          rel="noreferrer noopener"
          target="_blank"
        >
          jeu de données prénoms
        </a>
      </footer>
    </div>
  );
}
