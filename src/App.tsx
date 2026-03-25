import "./App.css";

const REF_URL = "https://github.com/gitname/react-gh-pages";

function App() {
  return (
    <div className="app">
      <div className="shell">
        <header className="header">
          <p className="eyebrow">Boilerplate · React · TypeScript · GitHub Pages</p>
          <h1 className="title">React GitHub Pages Boilerplate</h1>
          <p className="lead">
            Ce dépôt applique la même procédure que le tutoriel{" "}
            <strong>gitname/react-gh-pages</strong> : Create React App, champ{" "}
            <code>homepage</code>, paquet <code>gh-pages</code> et déploiement sur la
            branche <code>gh-pages</code>. Le guide détaillé est dans le{" "}
            <code>README.md</code> à la racine du projet.
          </p>
          <a className="ref" href={REF_URL} rel="noreferrer noopener" target="_blank">
            Référence : gitname/react-gh-pages →
          </a>
        </header>

        <section className="card">
          <h2>Prérequis</h2>
          <ul>
            <li>
              <strong>Node.js</strong> et <strong>npm</strong> installés
            </li>
            <li>
              <strong>Git</strong> installé
            </li>
            <li>Un compte <strong>GitHub</strong></li>
          </ul>
        </section>

        <section className="card">
          <h2>Installation</h2>
          <p>Après clonage du dépôt :</p>
          <div className="commands">
            <code className="command">cd &lt;votre-dossier-cloné&gt;</code>
            <code className="command">npm install</code>
          </div>
        </section>

        <section className="card">
          <h2>À personnaliser avant déploiement</h2>
          <ul>
            <li>
              Dans <code>package.json</code> : <code>homepage</code> →{" "}
              <code>https://&lt;utilisateur&gt;.github.io/&lt;nom-du-repo&gt;</code>{" "}
              (site projet) ou <code>https://&lt;utilisateur&gt;.github.io</code> (site
              utilisateur).
            </li>
            <li>
              Remplacer <code>YOUR_GITHUB_USERNAME</code> et{" "}
              <code>YOUR_REPO_NAME</code> par vos valeurs (déjà utilisés comme
              placeholders dans le boilerplate).
            </li>
            <li>
              Optionnel : <code>name</code>, <code>description</code>, titre dans{" "}
              <code>public/index.html</code>.
            </li>
          </ul>
        </section>

        <section className="card">
          <h2>Développement local</h2>
          <div className="commands">
            <code className="command">npm start</code>
          </div>
          <p>
            Ouvre l’app sur <code>http://localhost:3000</code> (rechargement à chaud).
          </p>
        </section>

        <section className="card">
          <h2>Build de production</h2>
          <div className="commands">
            <code className="command">npm run build</code>
          </div>
          <p>
            Sortie dans le dossier <code>build/</code>. Vous pouvez servir ce dossier
            avec un serveur statique pour vérifier le rendu avant déploiement.
          </p>
        </section>

        <section className="card">
          <h2>Déploiement sur GitHub Pages</h2>
          <ol style={{ margin: "0 0 0.65rem", paddingLeft: "1.15rem", color: "#475569" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Configurer le dépôt distant :{" "}
              <code style={{ fontSize: "0.85em" }}>
                git remote add origin https://github.com/&lt;user&gt;/&lt;repo&gt;.git
              </code>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Lancer <code>npm run deploy</code> (exécute le build puis pousse{" "}
              <code>build/</code> sur la branche <code>gh-pages</code>).
            </li>
            <li>
              Sur GitHub : <strong>Settings → Pages</strong> → source{" "}
              <strong>Deploy from a branch</strong> → branche <code>gh-pages</code>,
              dossier <code>/ (root)</code>.
            </li>
          </ol>
          <p style={{ marginBottom: 0 }}>
            Puis poussez le code source sur <code>main</code> (ou{" "}
            <code>master</code>) pour versionner les sources, comme dans l’étape 9 du
            tutoriel de référence.
          </p>
        </section>

        <p className="footer">
          Contenu aligné sur le README — modifiez un seul endroit de vérité en éditant
          le README si vous souhaitez une doc plus longue ; gardez cette page courte et
          cohérente.
        </p>
      </div>
    </div>
  );
}

export default App;
