import { useState, useEffect, useCallback } from 'react';
import { ProductsAPI, CategoriesAPI } from '../api/endpoints';
import { ProductCard } from '../components/ProductCard';
import { Spinner } from '../components/Spinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

const PAGE_SIZE = 12;

export function ProductCatalogue() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState('');
  const [sort, setSort] = useState('newest');

  // Debounced search term
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setQ(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [q, category, minPrice, maxPrice, inStock, sort]);

  // Fetch categories once
  useEffect(() => {
    CategoriesAPI.list()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        sort,
        q: q || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        inStock: inStock || undefined,
      };
      const result = await ProductsAPI.list(params);
      setProducts(result.products);
      setTotalPages(result.pages);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [page, q, category, minPrice, maxPrice, inStock, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="catalogue">
      <h1 className="catalogue__title">Store</h1>

      <div className="catalogue__filters">
        <input
          type="text"
          placeholder="Search products..."
          className="catalogue__search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="catalogue__select">
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.category}
            </option>
          ))}
        </select>

        <select value={inStock} onChange={(e) => setInStock(e.target.value)} className="catalogue__select">
          <option value="">All Stock</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>

        <input
          type="number"
          placeholder="Min price"
          className="catalogue__price-input"
          value={minPrice}
          min="0"
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max price"
          className="catalogue__price-input"
          value={maxPrice}
          min="0"
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)} className="catalogue__select">
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState message="No products match your filters." />
      ) : (
        <>
          <p className="catalogue__results-count">
            {total} {total === 1 ? 'product' : 'products'} found
          </p>
          <div className="catalogue__grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="catalogue__pagination">
              <button
                className="catalogue__page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="catalogue__page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="catalogue__page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
