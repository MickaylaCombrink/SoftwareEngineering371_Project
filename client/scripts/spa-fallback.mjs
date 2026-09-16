// GitHub Pages has no server-side routing: a request for /products/123 looks
// for that file, does not find it, and serves 404.html. Copying the built
// index.html there hands the URL to React Router instead, so a refresh or a
// shared deep link loads the right page.
//
// .nojekyll stops Pages running the build through Jekyll, which would drop
// any file or folder beginning with an underscore.
import { copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const index = resolve(dist, 'index.html');

if (!existsSync(index)) {
  console.error('spa-fallback: dist/index.html is missing — did the build run?');
  process.exit(1);
}

copyFileSync(index, resolve(dist, '404.html'));
writeFileSync(resolve(dist, '.nojekyll'), '');
console.log('spa-fallback: wrote dist/404.html and dist/.nojekyll');
