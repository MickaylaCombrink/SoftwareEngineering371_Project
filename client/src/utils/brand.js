const KNOWN_BRANDS = [
  'Al Haramain',
  'Arabiyat',
  'Ard Oud 24',
  'Barakkat',
  'Bentley',
  'Diamond Scents',
  'Emper',
  'Fragrance World',
  'French Avenue',
  'Gulf Orchid',
  'Lattafa',
  'Armaf',
  'Mousuf',
  'Nebras',
  'Riiffs',
  'Sawwar',
];

export function getProductBrand(productName) {
  if (!productName) return '';
  const hit = KNOWN_BRANDS.find((brand) => productName.startsWith(brand));
  return hit || '';
}