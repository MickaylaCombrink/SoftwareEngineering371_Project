export default function PromoBar() {
  return (
    <div className="bg-ink text-cream/85 border-b border-gold/20 text-[0.72rem] tracking-[0.18em] uppercase">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-center">
        <span>Fast &amp; reliable delivery nationwide</span>
        <span className="text-gold" aria-hidden="true">&#9670;</span>
        <span>Free shipping on orders over R 1 999</span>
      </div>
    </div>
  );
}