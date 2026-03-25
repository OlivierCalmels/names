# React GitHub Pages Boilerplate

Boilerplate **React** + **TypeScript** (**Create React App**) prêt pour **GitHub Pages**, en suivant la même procédure que le tutoriel officiel **[gitname/react-gh-pages](https://github.com/gitname/react-gh-pages)** (champ `homepage`, paquet npm `gh-pages`, scripts `predeploy` / `deploy`, dossier `build/` poussé sur la branche `gh-pages`).

> Ce dépôt n’est pas le tutoriel : c’est un point de départ clé en main. La référence technique détaillée reste [gitname/react-gh-pages](https://github.com/gitname/react-gh-pages).

## Prérequis

- **Node.js** **18+** (LTS recommandée ; le build CRA / ESLint peut échouer en dessous) et **npm**
  - Un fichier [`.nvmrc`](.nvmrc) est fourni (`18`) : avec [nvm](https://github.com/nvm-sh/nvm), exécutez `nvm use`.
- **Git**
- Un compte **GitHub**

## Démarrage rapide

```bash
git clone https://github.com/VOTRE_COMPTE/react_gh_page_boilerplate.git
cd react_gh_page_boilerplate
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

  Remplacez les placeholders `YOUR_GITHUB_USERNAME` et `YOUR_REPO_NAME` déjà présents dans ce boilerplate.

### 2. Métadonnées du site

- `public/index.html` — balise `<title>` et `meta description`.
- `public/manifest.json` — nom court / nom complet de l’app (PWA légère).

### 3. Contenu

- `src/App.tsx` et `src/App.css` — page d’accueil (actuellement un résumé visuel du README).

## Scripts npm

| Commande        | Description |
|-----------------|-------------|
| `npm start`     | Serveur de développement (CRA). |
| `npm run build` | Build de production dans `build/`. |
| `npm test`      | Tests (CRA / Jest). |
| `npm run deploy`| Build puis déploiement sur la branche `gh-pages` via le paquet `gh-pages`. |

`predeploy` exécute automatiquement `npm run build` avant `deploy`, comme dans [gitname/react-gh-pages](https://github.com/gitname/react-gh-pages).

## Déploiement sur GitHub Pages (résumé)

1. Créez un dépôt vide sur GitHub (ou réutilisez celui où vous avez poussé ce boilerplate).
2. Dans le clone local, ajoutez le remote si besoin :

   ```bash
   git remote add origin https://github.com/VOTRE_UTILISATEUR/VOTRE_REPO.git
   ```

3. Vérifiez que **`homepage`** dans `package.json` correspond exactement à l’URL finale du site.
4. Déployez le build :

   ```bash
   npm run deploy
   ```

   Cela crée ou met à jour la branche **`gh-pages`** avec le contenu de **`build/`**.

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

- **Écran blanc ou assets en 404** sur GitHub Pages : vérifiez que **`homepage`** correspond bien au chemin du site (nom du dépôt inclus pour un site projet).
- **`npm run deploy` refuse le push** : configurez l’authentification GitHub (HTTPS avec token, ou SSH) et assurez-vous que le remote `origin` pointe vers le bon dépôt.

## Licence

Ce boilerplate est fourni tel quel pour démarrer vos projets. Le tutoriel [gitname/react-gh-pages](https://github.com/gitname/react-gh-pages) reste la référence pédagogique.
