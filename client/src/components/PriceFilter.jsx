export default function PriceFilter({ min, max, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-ink mb-1">Price Range (ZAR)</label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={min}
          onChange={(e) => onChange({ minPrice: e.target.value })}
          className="w-1/2 input-lux py-2 text-sm placeholder:text-ink/30"
        />
        <input
          type="number"
          placeholder="Max"
          value={max}
          onChange={(e) => onChange({ maxPrice: e.target.value })}
          className="w-1/2 input-lux py-2 text-sm placeholder:text-ink/30"
        />
      </div>
    </div>
  );
}