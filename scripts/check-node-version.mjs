/**
 * Vérifie Node >= 18 avant build:data / aggregate (sql.js et tooling nécessitent une version récente).
 * Écrit en syntaxe compatible Node 12+ pour afficher un message clair au lieu de :
 *   SyntaxError: Unexpected token '||='
 */

var match = /^v(\d+)/.exec(process.version);
var major = match ? parseInt(match[1], 10) : 0;

if (major < 18) {
  console.error("");
  console.error("  Node " + process.version + " est trop ancien pour ce projet.");
  console.error("  Il faut Node 18 ou plus (sql.js, scripts ESM).");
  console.error("");
  console.error("  Avec nvm :");
  console.error("    cd " + process.cwd());
  console.error("    nvm use        # ou : nvm install 18 && nvm use 18");
  console.error("    node -v        # doit afficher v18.x ou plus");
  console.error("    npm run deploy");
  console.error("");
  process.exit(1);
}
