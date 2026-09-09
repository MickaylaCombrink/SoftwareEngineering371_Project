export default function PriceFilter({ min, max, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-ink mb-1">Price</label>
      <div className="space-y-3">
        <label className="block">
          <span className="text-[0.68rem] uppercase tracking-[0.18em] text-ink/45">From price</span>
          <input
            type="number"
            placeholder="e.g. 300"
            value={min}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="mt-1 w-full input-lux py-2 text-sm placeholder:text-ink/30"
          />
        </label>
        <label className="block">
          <span className="text-[0.68rem] uppercase tracking-[0.18em] text-ink/45">To price</span>
          <input
            type="number"
            placeholder="e.g. 2000"
            value={max}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="mt-1 w-full input-lux py-2 text-sm placeholder:text-ink/30"
          />
        </label>
      </div>
    </div>
  );
}