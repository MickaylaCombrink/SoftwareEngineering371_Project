// Image paths in the database are site-absolute ("/images/x.webp"), which the
// browser resolves against the domain root. GitHub Pages serves the site from
// /<repo>/ instead, so the root-relative path points at a file that is not
// there. Prefixing with Vite's base makes the same value work in development,
// on Pages, and on any future domain.
//
// Full URLs and inline data are returned untouched: a product whose image is
// hosted elsewhere must not be rewritten. A scheme is required for that —
// treating a bare "//" as protocol-relative would read "//images/x.webp",
// which is a stray slash in the data, as a request to the host "images".
const BASE = import.meta.env.BASE_URL || '/';

export function assetUrl(path) {
  if (!path) return '';

  const value = String(path);
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;

  return `${BASE.replace(/\/+$/, '')}/${value.replace(/^\/+/, '')}`;
}
