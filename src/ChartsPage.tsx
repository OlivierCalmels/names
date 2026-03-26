import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";
import {
  mergeChartRows,
  queryNameSeries,
  resolvePrenom,
  type SqlDb,
} from "./birthsDb";
import { fetchBirthsDatabase, initSqlFromWasm } from "./sqlAssets";

const PUBLIC_URL = process.env.PUBLIC_URL ?? "";
const MAX_NAMES = 10;

const LINE_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#ca8a04",
  "#9333ea",
  "#db2777",
  "#0d9488",
  "#ea580c",
  "#4f46e5",
  "#b45309",
];

export default function ChartsPage() {
  const [db, setDb] = useState<SqlDb | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  const [prenoms, setPrenoms] = useState<string[]>([]);
  const [listsError, setListsError] = useState<string | null>(null);
  const [loadingLists, setLoadingLists] = useState(true);

  const [sexe, setSexe] = useState<"" | "1" | "2">("");
  const [nameInput, setNameInput] = useState("");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [nameHint, setNameHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let instance: SqlDb | null = null;

    (async () => {
      setLoadingDb(true);
      setLoadError(null);
      try {
        const SQL = await initSqlFromWasm(PUBLIC_URL);
        const buf = await fetchBirthsDatabase(PUBLIC_URL);
        instance = new SQL.Database(new Uint8Array(buf));
        if (!cancelled) setDb(instance);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : String(e));
          setDb(null);
        } else if (instance) {
          instance.close();
        }
      } finally {
        if (!cancelled) setLoadingDb(false);
      }
    })();

    return () => {
      cancelled = true;
      if (instance) instance.close();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingLists(true);
      setListsError(null);
      try {
        const base = PUBLIC_URL.replace(/\/$/, "");
        const pRes = await fetch(`${base}/data/prenoms`);
        if (!pRes.ok) {
          throw new Error("Liste prénoms introuvable. Lancez npm run build:data.");
        }
        const prenomsJson = (await pRes.json()) as string[];
        if (!cancelled) setPrenoms(prenomsJson);
      } catch (e) {
        if (!cancelled) setListsError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoadingLists(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartRows = useMemo(() => {
    if (!db || selectedNames.length === 0) return [];
    const series = new Map<string, ReturnType<typeof queryNameSeries>>();
    for (const name of selectedNames) {
      series.set(name, queryNameSeries(db, name, sexe));
    }
    return mergeChartRows(selectedNames, series);
  }, [db, selectedNames, sexe]);

  const suggestions = useMemo(() => {
    const t = nameInput.trim().toLowerCase();
    if (t.length < 1 || prenoms.length === 0) return [];
    const out: string[] = [];
    for (const p of prenoms) {
      if (p.toLowerCase().startsWith(t)) {
        out.push(p);
        if (out.length >= 40) break;
      }
    }
    return out;
  }, [nameInput, prenoms]);

  const tryAddName = useCallback(() => {
    setNameHint(null);
    const resolved = resolvePrenom(nameInput, prenoms);
    if (!resolved) {
      setNameHint("Prénom inconnu dans le fichier INSEE (vérifiez l’orthographe).");
      return;
    }
    if (selectedNames.includes(resolved)) {
      setNameHint(`« ${resolved} » est déjà affiché.`);
      return;
    }
    if (selectedNames.length >= MAX_NAMES) {
      setNameHint(`Vous ne pouvez comparer que ${MAX_NAMES} prénoms maximum.`);
      return;
    }
    setSelectedNames((prev) => [...prev, resolved]);
    setNameInput("");
  }, [nameInput, prenoms, selectedNames]);

  const removeName = (name: string) => {
    setSelectedNames((prev) => prev.filter((n) => n !== name));
  };

  const dataReady = Boolean(db && prenoms.length > 0 && !listsError);

  return (
    <div className="app">
      <header className="header">
        <p className="eyebrow">
          <span className="eyebrow-inner">Open data INSEE</span>
          <span className="eyebrow-sep" aria-hidden="true" />
          <span>France entière — national_prenoms.csv</span>
        </p>
        <h1 className="title">La popularité des prénoms au fil des années</h1>
        <p className="lead">
          Superposez jusqu’à <strong>{MAX_NAMES} prénoms</strong> sur un même graphique pour comparer
          leur évolution. Filtrez éventuellement par sexe (1 = garçons, 2 = filles) ou laissez le
          champ vide pour tous les sexes. Les données sont nationales (agrégat sans département).
          Les années non
          renseignées dans la source (<code>XXXX</code>) sont ignorées sur l’axe du temps.
        </p>
      </header>

      {(loadError || listsError) && (
        <div className="banner banner--error" role="alert">
          <strong>Erreur.</strong> {loadError ?? listsError}
        </div>
      )}

      <section className="controls" aria-label="Filtres et sélection de prénoms">
        <div className="control-grid">
          <label className="field">
            <span className="field-label">Sexe</span>
            <select
              className="field-input"
              value={sexe}
              onChange={(e) => setSexe(e.target.value as "" | "1" | "2")}
              disabled={!dataReady}
            >
              <option value="">Tous</option>
              <option value="1">Garçon (1)</option>
              <option value="2">Fille (2)</option>
            </select>
          </label>

        </div>

        <div className="name-row">
          <label className="field field--grow">
            <span className="field-label">Ajouter un prénom</span>
            <input
              className="field-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") tryAddName();
              }}
              disabled={!dataReady}
              placeholder="Ex. Jean, Marie…"
              list="prenoms-datalist"
              autoComplete="off"
              spellCheck={false}
            />
            <datalist id="prenoms-datalist">
              {suggestions.slice(0, 15).map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </label>
          <button type="button" className="btn btn--primary" onClick={tryAddName} disabled={!dataReady}>
            Ajouter
          </button>
        </div>
        {nameHint && <p className="hint">{nameHint}</p>}

        {selectedNames.length > 0 && (
          <ul className="chips" aria-label="Prénoms sélectionnés">
            {selectedNames.map((n) => (
              <li key={n} className="chip">
                <span>{n}</span>
                <button type="button" className="chip-remove" onClick={() => removeName(n)} aria-label={`Retirer ${n}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="chart-section" aria-label="Graphique">
        {loadingDb && <p className="status">Chargement de la base… (premier chargement peut être long)</p>}
        {!loadingDb && !db && !loadError && <p className="status">Base non disponible.</p>}
        {dataReady && selectedNames.length === 0 && (
          <p className="status">Ajoutez au moins un prénom pour afficher le graphique.</p>
        )}
        {dataReady && selectedNames.length > 0 && chartRows.length === 0 && (
          <p className="status">Aucune donnée pour cette combinaison de filtres.</p>
        )}
        {dataReady && chartRows.length > 0 && (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <LineChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickMargin={8} />
                <YAxis tick={{ fontSize: 11 }} tickMargin={8} width={48} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value.toLocaleString("fr-FR"),
                    name,
                  ]}
                  labelFormatter={(y) => `Année ${y}`}
                />
                <Legend wrapperStyle={{ fontSize: "13px" }} />
                {selectedNames.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    name={name}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {loadingLists && !listsError && <p className="status muted">Chargement des listes…</p>}
      </section>

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
