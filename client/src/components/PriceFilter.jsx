export default function PriceFilter({ min, max, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Price Range (ZAR)</label>
      <div className="flex space-x-2">
        <input
          type="number"
          placeholder="Min"
          value={min}
          onChange={(e) => onChange({ minPrice: e.target.value })}
          className="w-1/2 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <input
          type="number"
          placeholder="Max"
          value={max}
          onChange={(e) => onChange({ maxPrice: e.target.value })}
          className="w-1/2 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
    </div>
  );
}
