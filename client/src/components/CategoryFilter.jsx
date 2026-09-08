export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelect('')}
        className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
          !selected
            ? 'bg-ink text-cream font-semibold shadow-lux'
            : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
        }`}
      >
        All Categories
      </button>
      {categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => onSelect(cat._id)}
          className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
            selected === cat._id
              ? 'bg-ink text-cream font-semibold shadow-lux'
              : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
          }`}
        >
          {cat.category}
        </button>
      ))}
    </div>
  );
}