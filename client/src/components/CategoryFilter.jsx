export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelect('')}
        className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
          !selected ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        All Categories
      </button>
      {categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => onSelect(cat._id)}
          className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
            selected === cat._id ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {cat.category}
        </button>
      ))}
    </div>
  );
}
