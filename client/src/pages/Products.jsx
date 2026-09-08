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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-10">
        <p className="eyebrow mb-2">The boutique</p>
        <h1 className="font-display text-4xl text-ink">Our Collection</h1>
        <p className="mt-3 text-ink/55 max-w-2xl">Forty rare fragrances, photographed and hand-picked. Filter by family, price and availability to find your signature.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">
          <div className="card-lux p-5">
            <h3 className="font-display text-lg text-ink mb-3">Categories</h3>
            <CategoryFilter categories={categories} selected={categoryParam} onSelect={handleCategoryChange} />
          </div>
          <div className="card-lux p-5">
            <PriceFilter min={minPrice} max={maxPrice} onChange={handlePriceChange} />
            <button
              onClick={applyPriceFilter}
              className="mt-4 w-full btn-ink py-2.5 text-sm"
            >
              Apply Filter
            </button>
          </div>
          <label className="flex items-center gap-3 text-sm text-ink/70 card-lux p-5 cursor-pointer">
            <input
              type="checkbox"
              checked={query.inStock || false}
              onChange={(e) => setQuery((prev) => ({ ...prev, inStock: e.target.checked }))}
              className="h-4 w-4 rounded border-ink/25"
            />
            In Stock Only
          </label>
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card-lux overflow-hidden animate-pulse">
                  <div className="aspect-square bg-blush"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-ink/10 rounded w-3/4"></div>
                    <div className="h-3 bg-ink/10 rounded w-full"></div>
                    <div className="h-5 bg-ink/10 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg">{error}</p>
              <button
                onClick={() => setQuery({})}
                className="mt-4 btn-ink text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-ink">No products found</p>
              <p className="text-ink/55 mt-2">Nothing matches those filters — try widening your search.</p>
              <button
                onClick={() => { setQuery({}); setMinPrice(''); setMaxPrice(''); setSearchParams({}); }}
                className="mt-6 btn-gold text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink/45 mb-4 tracking-wide uppercase">{products.length} fragrance{products.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}