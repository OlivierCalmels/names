# React GitHub Pages Boilerplate

Boilerplate **React** + **TypeScript** (**Create React App**) prêt pour **GitHub Pages**, en suivant la même procédure que le tutoriel officiel **[gitname/react-gh-pages](https://github.com/gitname/react-gh-pages)** (champ `homepage`, paquet npm `gh-pages`, scripts `predeploy` / `deploy`, dossier `build/` poussé sur la branche `gh-pages`).

> Ce dépôt n’est pas le tutoriel : c’est un point de départ clé en main. La référence technique détaillée reste [gitname/react-gh-pages](https://github.com/gitname/react-gh-pages).

## Prérequis

- **Node.js** **18+** (LTS) et **npm** — obligatoire : sous **Node 14**, ESLint / CRA peut planter avec `Cannot find module 'node:path'`.
  - Un fichier [`.nvmrc`](.nvmrc) est fourni (`18`) : avec [nvm](https://github.com/nvm-sh/nvm), exécutez `nvm use` dans le dossier du projet avant `npm install` / `npm start`.
  - Le fichier [`.npmrc`](.npmrc) active `engine-strict=true` : une version de Node incompatible avec `package.json` fera échouer `npm install`.
- **Git**
- Un compte **GitHub**

**Remote Git** : ce dépôt utilise `origin` → [https://github.com/OlivierCalmels/names.git](https://github.com/OlivierCalmels/names.git). Pour pointer vers un autre dépôt après coup : `git remote set-url origin https://github.com/UTILISATEUR/REPO.git`.

## Démarrage rapide

```bash
git clone https://github.com/OlivierCalmels/names.git
cd names
nvm use   # ou : nvm use 18 — voir .nvmrc
npm install
npm start
```

L’application s’ouvre sur [http://localhost:3000](http://localhost:3000).

## À personnaliser avant publication

### 1. `package.json`

- **`name`** — nom npm du projet (ex. `mon-site-github-pages`).
- **`homepage`** — URL publique du site GitHub Pages :
  - **Site projet** (`https://utilisateur.github.io/nom-du-repo/`) :

    ```text
    https://VOTRE_UTILISATEUR.github.io/VOTRE_REPO
    ```

  - **Site utilisateur** (`https://utilisateur.github.io/`) :

    ```text
    https://VOTRE_UTILISATEUR.github.io
    ```

  Remplacez les placeholders `OlivierCalmels` et `Names` déjà présents dans ce boilerplate.

### 2. Métadonnées du site

- `public/index.html` — balise `<title>` et `meta description`.
- `public/manifest.json` — nom court / nom complet de l’app (PWA légère).

### 3. Contenu

- `src/App.tsx` et `src/App.css` — page d’accueil (actuellement un résumé visuel du README).

## Scripts npm

| Commande          | Description |
|-------------------|-------------|
| `npm start`       | Serveur de développement (CRA). |
| `npm run aggregate:csv` | Lit le fichier INSEE **départemental** (`data/dpt2022.csv` par défaut) et écrit `data/national_prenoms.csv` (sommes par sexe, prénom, année). |
| `npm run build:data` | Regénère `public/data/*`, `public/sqljs/sql-wasm.wasm` et la base SQLite depuis `data/national_prenoms.csv` (Node 18+). |
| `npm run check:data` | Vérifie que ces fichiers existent et ne sont pas plus anciens que `data/national_prenoms.csv` (hook pre-commit). |
| `npm run build`   | Build de production dans `build/` (lance d’abord `build:data` via `prebuild`). |
| `npm test`        | Tests (CRA / Jest). |
| `npm run deploy`  | Build puis déploiement sur la branche `gh-pages` via le paquet `gh-pages`. |

`predeploy` exécute automatiquement `npm run build` avant `deploy`, comme dans [gitname/react-gh-pages](https://github.com/gitname/react-gh-pages).

### Hook Git pre-commit

Après `npm install`, le script `prepare` enregistre `core.hooksPath=githooks` pour ce dépôt. Avant chaque commit, **`npm run check:data`** contrôle que les sorties de `build:data` sont présentes et à jour par rapport à `data/national_prenoms.csv`. Pour ignorer ponctuellement : `git commit --no-verify`.

## Déploiement sur GitHub Pages (résumé)

1. Créez un dépôt vide sur GitHub (ou réutilisez celui où vous avez poussé ce boilerplate).
2. Dans le clone local, configurez `origin` :
   - **Nouveau clone** : le remote est déjà `https://github.com/OlivierCalmels/names.git`.
   - **Première fois** : `git remote add origin https://github.com/OlivierCalmels/names.git`
   - **Remote existant à corriger** : `git remote set-url origin https://github.com/OlivierCalmels/names.git`

3. Vérifiez que **`homepage`** dans `package.json` correspond exactement à l’URL finale du site.
4. Déployez le build :

   ```bash
   npm run deploy
   ```

   Cela crée ou met à jour la branche **`gh-pages`** avec le contenu de **`build/`**.

   La base SQLite est servie sous forme **gzip** (`births_packed`) pour rester **sous la limite GitHub de 100 Mo par fichier**. Si le push échoue encore avec une erreur HTTP 400 / `send-pack`, essayez : `git config http.postBuffer 524288000`.

5. Sur GitHub : **Settings → Pages** → **Build and deployment** :
   - **Source** : *Deploy from a branch*
   - **Branch** : `gh-pages`, dossier **`/ (root)`**

6. (Recommandé) Versionnez le code source sur la branche principale :

   ```bash
   git add .
   git commit -m "Configure le projet pour GitHub Pages"
   git push -u origin main
   ```

   (Utilisez `master` si c’est la branche par défaut de votre dépôt.)

Après quelques instants, le site est disponible à l’URL définie dans **`homepage`**.

## Vérifier le build en local

```bash
npm run build
npx serve -s build
```

(Sans `serve` : `npx serve -s build` au besoin.) Ouvrez l’URL indiquée pour un aperçu proche de la production.

## Page d’accueil

La page React affiche un **résumé** des étapes ci-dessus (mêmes commandes et même ordre logique) avec un lien vers le tutoriel [gitname/react-gh-pages](https://github.com/gitname/react-gh-pages).

## Dépannage

- **`Cannot find module 'node:path'` (ESLint / compilation)** : version de Node trop ancienne (p.ex. Node 14). Utilisez **Node 18 LTS** (`nvm use`, voir `.nvmrc`) puis relancez `npm start`. À éviter : désactiver ESLint (`DISABLE_ESLINT_PLUGIN=true`) sauf urgence.
- **Écran blanc ou assets en 404** sur GitHub Pages : vérifiez que **`homepage`** correspond bien au chemin du site (nom du dépôt inclus pour un site projet).
- **`npm run deploy` / push `gh-pages` en échec** : limite GitHub **100 Mo par fichier** (d’où la base en **gzip** `births_packed`) ; en HTTPS, erreur **HTTP 400** possible → `git config http.postBuffer 524288000`, ou remote en **SSH**. Vérifiez aussi l’authentification (token, SSH).

## Licence

Ce boilerplate est fourni tel quel pour démarrer vos projets. Le tutoriel [gitname/react-gh-pages](https://github.com/gitname/react-gh-pages) reste la référence pédagogique.
