// Money and delivery helpers. Prices are ZAR throughout.

const FREE_DELIVERY_THRESHOLD = 550;
const DELIVERY_FEE = 95;

// "R1 707.00" — narrow space for thousands, matching the prototype
export function formatPrice(amount) {
  const value = Number(amount) || 0;
  return `R${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
}

// Delivery is presentational: the backend charges for items only, so the
// fee is shown consistently across cart, checkout and confirmation.
export function deliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE };

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Short, human order reference derived from the Mongo id
export function orderReference(id) {
  if (!id) return '';
  return `SCT-${String(id).slice(-6).toUpperCase()}`;
}

// Courier window shown on the confirmation screen
export function deliveryWindow(placedAt) {
  const start = new Date(placedAt || Date.now());
  const from = new Date(start);
  from.setDate(from.getDate() + 2);
  const to = new Date(start);
  to.setDate(to.getDate() + 4);

  const day = (d) => d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  return `${day(from)} – ${day(to)}`;
}
