# React GitHub Pages Boilerplate

Boilerplate **React** + **TypeScript** (**Create React App**) prêt pour **GitHub Pages**, en suivant la même procédure que le tutoriel officiel **[gitname/react-gh-pages](https://github.com/gitname/react-gh-pages)** (champ `homepage`, paquet npm `gh-pages`, scripts `predeploy` / `deploy`, dossier `build/` poussé sur la branche `gh-pages`).

> Ce dépôt n’est pas le tutoriel : c’est un point de départ clé en main. La référence technique détaillée reste [gitname/react-gh-pages](https://github.com/gitname/react-gh-pages).

## Prérequis

- **Node.js** **18+** (LTS) et **npm** — obligatoire pour tout le projet, en particulier **`npm run build`**, **`npm run build:data`** et **`npm run deploy`** : la dépendance **sql.js** (et les scripts `*.mjs`) exigent un Node récent. Avec **Node 14** ou autre version &lt; 18, vous obtiendrez entre autres **`SyntaxError: Unexpected token '||='`** dans `sql-wasm.js`.
  - Un fichier [`.nvmrc`](.nvmrc) est fourni (`18`) : avec [nvm](https://github.com/nvm-sh/nvm), placez-vous dans le dossier du projet puis :
    ```bash
    nvm use                    # ou : nvm install 18 && nvm use 18
    node -v                    # doit afficher v18.x ou supérieur
    ```
    Tant que **`node -v`** n’affiche pas au moins **v18**, ne lancez pas le build ni le déploiement : utilisez **`nvm use`** dans **chaque** terminal ou configurez votre IDE pour utiliser ce Node.
  - Avant **`npm run deploy`**, les mêmes vérifications s’appliquent (voir la section [Déploiement](#déploiement-sur-github-pages)).
  - Le fichier [`.npmrc`](.npmrc) active `engine-strict=true` : une version de Node incompatible avec `package.json` fera échouer `npm install`.
  - Sous **Node 14**, ESLint / CRA peut aussi planter avec `Cannot find module 'node:path'` — même remède : passer à Node 18+.
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

- `src/` — application (graphiques prénoms, page Records), styles dans `App.css`.

## Scripts npm

| Commande          | Description |
|-------------------|-------------|
| `npm start`       | Serveur de développement (CRA). |
| `npm run aggregate:csv` | Lit le fichier INSEE **départemental** (`data/dpt2022.csv` par défaut) et écrit `data/national_prenoms.csv` (sommes par sexe, prénom, année). |
| `npm run build:data` | Regénère `public/data/*`, `public/sqljs/sql-wasm.wasm` et la base SQLite depuis `data/national_prenoms.csv` (Node 18+). |
| `npm run check:data` | Vérifie que ces fichiers existent et ne sont pas plus anciens que `data/national_prenoms.csv` (hook pre-commit). |
| `npm run build`   | Build de production dans `build/` (lance d’abord `build:data` via `prebuild`). |
| `npm test`        | Tests (CRA / Jest). |
| `npm run deploy`  | Build puis envoi du dossier `build/` sur la branche `gh-pages` (site public GitHub Pages). |
| `npm run gh-pages-clean` | Supprime le cache local du paquet `gh-pages` (à utiliser si `deploy` échoue avec *branch … already exists*). |

`predeploy` exécute automatiquement `npm run build` avant `deploy`, comme dans [gitname/react-gh-pages](https://github.com/gitname/react-gh-pages). `build` déclenche au passage `build:data` (`prebuild`).

### Hook Git pre-commit

Après `npm install`, le script `prepare` enregistre `core.hooksPath=githooks` pour ce dépôt. Avant chaque commit, **`npm run check:data`** contrôle que les sorties de `build:data` sont présentes et à jour par rapport à `data/national_prenoms.csv`. Pour ignorer ponctuellement : `git commit --no-verify`.

## Déploiement sur GitHub Pages

### À chaque mise en ligne du site (après vos changements)

1. **Obligatoire : Node 18+** dans ce terminal. Le build exécute **sql.js** ; un Node trop ancien provoque une erreur du type **`Unexpected token '||='`**. Depuis la racine du dépôt :
   ```bash
   nvm use                    # ou : nvm install 18 && nvm use 18
   node -v                    # doit afficher v18.x ou plus — sinon corrigez avant la suite
   ```
   Le script **`scripts/check-node-version.mjs`** est lancé automatiquement avant **`build:data`** : s’il affiche un message d’erreur, c’est que ce **`node`** n’est pas le bon.

2. Déployez (build + push de `build/` vers la branche **`gh-pages`**) :

   ```bash
   npm run deploy
   ```

   Cette commande enchaîne **`predeploy`** → `npm run build` (dont **`build:data`** + génération SQLite) → publication via **`gh-pages`**.

3. Sur GitHub : **Settings → Pages** → **Build and deployment** :
   - **Source** : *Deploy from a branch* (pas « GitHub Actions » pour ce flux).
   - **Branch** : **`gh-pages`**, dossier **`/ (root)`** — **pas** la branche `main` : sinon ce n’est pas le build CRA qui sert le site.

4. Ouvrez l’URL indiquée par **`homepage`** dans `package.json` (ex. `https://OlivierCalmels.github.io/names/` — graphiques souvent en `…/names/#/`).

Le code source peut continuer à vivre sur **`main`** : `git push origin main` met à jour le dépôt, mais **ne met pas à jour le site** tant que vous n’avez pas refait **`npm run deploy`**.

### Première configuration du dépôt

1. Créez ou réutilisez un dépôt GitHub ; configurez **`origin`** si besoin (`git remote add` / `set-url`).
2. Vérifiez que **`homepage`** dans `package.json` correspond **exactement** à l’URL publique du site (chemin du repo inclus pour un site *projet*).

### Si `npm run deploy` échoue

- **`fatal: A branch named 'gh-pages' already exists`** (cache `gh-pages` corrompu) : `npm run gh-pages-clean`, puis `npm run deploy`.
- **`RPC failed; HTTP 400`** / **`send-pack`** en HTTPS : `git config --global http.postBuffer 524288000`, puis `npm run gh-pages-clean` et `npm run deploy` ; ou passez **`origin` en SSH** (`git@github.com:…`).

La base SQLite est servie en **gzip** (`births_packed`) pour rester sous la **limite GitHub de 100 Mo par fichier**.

## Vérifier le build en local

Même exigence **Node 18+** que pour le déploiement (`nvm use`, puis `node -v`).

```bash
nvm use
node -v   # v18.x ou plus
npm run build
npx serve -s build
```

(Sans `serve` : `npx serve -s build` au besoin.) Ouvrez l’URL indiquée pour un aperçu proche de la production.

## Dépannage

- **`Cannot find module 'node:path'` (ESLint / compilation)** : version de Node trop ancienne (p.ex. Node 14). Utilisez **Node 18 LTS** (`nvm use`, voir `.nvmrc`) puis relancez `npm start`. À éviter : désactiver ESLint (`DISABLE_ESLINT_PLUGIN=true`) sauf urgence.
- **`SyntaxError: Unexpected token '||='`** dans `sql-wasm.js` lors de **`npm run build`** / **`npm run deploy`** : le **`node`** invoqué n’est pas en **18+** (souvent un Node système 14 tandis que le terminal n’a pas chargé nvm). Vérifiez avec **`node -v`**, puis **`nvm use 18`** (ou **`nvm use`**) dans le dossier du projet avant `npm run deploy`. Le projet exécute désormais **`scripts/check-node-version.mjs`** avant `build:data` pour afficher ce rappel explicitement.
- **Vous voyez tout le README (prérequis, table des commandes…) au lieu de l’app** : c’est en général la **page du dépôt** sur GitHub (`github.com/…/names`), qui affiche `README.md`. L’**application** est sur **`https://<utilisateur>.github.io/names/`** avec cette URL de base ; avec le routage par hash, l’accueil est souvent **`…/names/#/`**. Dans **Settings → Pages**, la source doit être la branche **`gh-pages`**, dossier **`/` (root)**.
- **Écran blanc ou assets en 404** sur GitHub Pages : vérifiez que **`homepage`** correspond bien au chemin du site (nom du dépôt inclus pour un site projet).
- **`npm run deploy` / push `gh-pages` en échec** : limite GitHub **100 Mo par fichier** (d’où la base en **gzip** `births_packed`). Si le push échoue avec **`RPC failed; HTTP 400`** / **`send-pack`** / *remote end hung up* : le module **`gh-pages` pousse depuis un clone en cache** (`node_modules/.cache/...`) ; augmentez le buffer **(souvent nécessaire en `--global`)** : `git config --global http.postBuffer 524288000`, puis `npm run gh-pages-clean` et `npm run deploy`. Sinon : passer **`origin` en SSH** (`git@github.com:…`) au lieu d’HTTPS, ou vérifier token / accès au dépôt.

## Licence

Ce boilerplate est fourni tel quel pour démarrer vos projets. Le tutoriel [gitname/react-gh-pages](https://github.com/gitname/react-gh-pages) reste la référence pédagogique.
