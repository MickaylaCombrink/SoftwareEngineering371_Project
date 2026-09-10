# Product images

Vite serves everything in `client/public/` from the site root. A file saved
here as:

    client/public/images/lattafa-maahir-honor-edp-100ml.webp

is served at:

    http://localhost:5173/images/lattafa-maahir-honor-edp-100ml.webp

which is exactly what the `image` field on each product in MongoDB points at.

## Getting the filenames

Every filename is the product name, lowercased, with non-letters turned into
hyphens. To print the full list from the database, run this in the project
root:

    node src/scripts/fixProductImages.js --list

## Adding an image

Save the file here under the matching name. No code change and no reseed is
needed — reload the page and it appears.

Any product whose file is missing falls back to the drawn bottle in
`client/src/components/Bottle.jsx`, so a gap never shows a broken image.

## Notes

- `.webp` is expected by default. If you save a `.jpg` or `.png` instead,
  update that product's `image` field to match the extension.
- Keep them roughly 800×1000 and under ~200 KB, or the catalogue gets slow.
- Do not put a full `https://` link in the database. SharePoint and Google
  Drive "share" links return an HTML viewer page rather than the image file,
  so an `<img>` tag can never display them.
