import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products', { params: { inStock: 'true' } }),
          api.get('/categories'),
        ]);
        setFeatured(prodRes.data.data.products.slice(0, 6));
        setCategories(catRes.data.data.categories);
      } catch { /* ignore */ }
    };
    load();
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Your <span className="text-amber-400">Signature Scent</span>
          </h1>
          <p className="text-lg text-indigo-200 mb-8 max-w-2xl mx-auto">
            Explore our curated collection of premium fragrances — from fresh citrus
            to deep oriental blends, find the perfume that tells your story.
          </p>
          <Link
            to="/products"
            className="inline-block bg-amber-500 text-indigo-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-400 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className="bg-indigo-50 rounded-lg p-6 text-center hover:bg-indigo-100 transition-colors"
            >
              <h3 className="font-semibold text-indigo-800">{cat.category}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
