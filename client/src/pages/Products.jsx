import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import PriceFilter from '../components/PriceFilter';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const categoryParam = searchParams.get('category') || '';
  const { products, loading, error, query, setQuery } = useProducts({ category: categoryParam });

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setQuery((prev) => ({ ...prev, category: categoryParam }));
  }, [categoryParam, setQuery]);

  const handleCategoryChange = (catId) => {
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  const handlePriceChange = ({ minPrice: min, maxPrice: max }) => {
    if (min !== undefined) setMinPrice(min);
    if (max !== undefined) setMaxPrice(max);
  };

  const applyPriceFilter = () => {
    setQuery((prev) => ({ ...prev, minPrice, maxPrice }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Collection</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <CategoryFilter
              categories={categories}
              selected={categoryParam}
              onSelect={handleCategoryChange}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <PriceFilter min={minPrice} max={maxPrice} onChange={handlePriceChange} />
            <button
              onClick={applyPriceFilter}
              className="mt-3 w-full bg-indigo-600 text-white py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Apply Filter
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-lg shadow p-4">
            <input
              type="checkbox"
              checked={query.inStock || false}
              onChange={(e) => setQuery((prev) => ({ ...prev, inStock: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600"
            />
            In Stock Only
          </label>
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
              <button
                onClick={() => setQuery({})}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              <button
                onClick={() => { setQuery({}); setMinPrice(''); setMaxPrice(''); setSearchParams({}); }}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
