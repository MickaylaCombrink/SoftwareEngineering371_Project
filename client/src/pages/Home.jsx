import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const categoryTints = [
  'from-[#6b4a2a] to-[#2c2418]',
  'from-[#7a3550] to-[#2c2030]',
  'from-[#3f4a3a] to-[#20271f]',
  'from-[#4a3f6b] to-[#262030]',
  'from-[#7a6a3a] to-[#2c2a18]',
  'from-[#3a5a6b] to-[#1e2a30]',
  'from-[#6b3a3a] to-[#301f20]',
];

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

  const heroImage = featured[0]?.image?.[0];

  return (
    <div>
      {/* ————— Hero ————— */}
      <section className="relative bg-ink text-cream overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -right-40 w-[34rem] h-[34rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-32 w-[30rem] h-[30rem] rounded-full bg-gold/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative">
          <div className="animate-fade-up">
            <p className="eyebrow mb-4">The Maison Collection &middot; 2026</p>
            <h1 className="font-display text-4xl md:text-6xl text-balance leading-[1.08]">
              Discover Your
              <span className="block italic text-gold-2">Signature Scent</span>
            </h1>
            <p className="mt-6 text-cream/70 text-lg max-w-xl leading-relaxed">
              From glowing ambers and rare ouds to the softest gourmands — a
              hand-selected boutique of fragrances that speak before you do.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/products" className="btn-gold text-base">
                Shop Now
              </Link>
              <Link to="/products" className="btn-ink text-base bg-cream/10 backdrop-blur border border-cream/20">
                Browse Collection
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-8 text-sm text-cream/60">
              <div><p className="font-display text-2xl text-gold-2">40+</p><p>Signature scents</p></div>
              <div><p className="font-display text-2xl text-gold-2">100%</p><p>Authentic bottles</p></div>
              <div><p className="font-display text-2xl text-gold-2">Free</p><p>Nationwide delivery</p></div>
            </div>
          </div>

          <div className="relative flex justify-center pointer-events-none">
            {heroImage ? (
              <div className="relative w-72 h-80 md:w-80 md:h-96">
                <div className="absolute inset-0 rounded-b-[5rem] rounded-t-full bg-gradient-to-b from-gold/40 to-gold/5 blur-2xl -scale-x-100" />
                <img
                  src={heroImage}
                  alt="Featured fragrance"
                  className="relative w-full h-full object-cover arch border border-gold/25 shadow-lux animate-float-slow"
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-ink-soft border border-gold/30 rounded-full px-5 py-2 text-xs tracking-[0.3em] uppercase">
                  N&deg; 001
                </div>
              </div>
            ) : (
              <div className="w-72 h-80 md:w-80 md:h-96 rounded-b-[5rem] rounded-t-full bg-gradient-to-b from-gold/30 to-ink-mute animate-pulse" />
            )}
          </div>
        </div>
      </section>

      {/* ————— Category showcase ————— */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow mb-2">Curated families</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink">Shop by Category</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat, idx) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${categoryTints[idx % categoryTints.length]} p-7 min-h-[9rem] flex flex-col justify-end group hover:-translate-y-1 transition-transform duration-300 shadow-lux`}
            >
              <span className="absolute top-4 right-5 font-display italic text-cream/25 text-5xl group-hover:text-gold/40 transition-colors">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-2xl text-cream group-hover:text-gold-2 transition-colors">{cat.category}</h3>
              <p className="text-sm text-cream/70 mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
              <span className="inline-flex items-center gap-2 text-xs text-gold-2 mt-3 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <span>&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ————— Featured products ————— */}
      {featured.length > 0 && (
        <section className="bg-cream py-16 md:py-20 border-y border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="eyebrow mb-2">Loved this season</p>
                <h2 className="font-display text-3xl md:text-4xl text-ink">Featured Products</h2>
              </div>
              <Link to="/products" className="hidden sm:inline-flex items-center gap-2 text-sm text-gold-3 hover:text-ink font-medium tracking-wide uppercase">
                View all <span>&rarr;</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link to="/products" className="btn-ink text-sm">View all products</Link>
            </div>
          </div>
        </section>
      )}

      {/* ————— Promise strip ————— */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: 'M12 2l7 5v10l-7 5-7-5V7l7-5z', title: 'Authenticity Guaranteed', text: 'Every bottle sealed and verified from official suppliers.' },
            { icon: 'M12 3v18M3 12h18', title: 'Free Delivery', text: 'Free nationwide shipping on all orders over R500.' },
            { icon: 'M9 12l2 2 4-4M7 3h10l4 4v13a1 1 0 01-1 1H4a1 1 0 01-1-1V7l4-4z', title: 'Secure Checkout', text: 'Bank-grade encryption for a worry-free purchase.' },
            { icon: 'M4 19l8-6 8 6M4 5h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z', title: 'Gift Wrapping', text: 'Signature gold-ribbon gift service at no extra cost.' },
          ].map((b) => (
            <div key={b.title} className="card-lux p-6 flex flex-col items-start gap-3">
              <span className="w-11 h-11 rounded-full bg-gold/15 text-gold-3 flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={b.icon} />
                </svg>
              </span>
              <h3 className="font-display text-lg text-ink">{b.title}</h3>
              <p className="text-sm text-ink/55 leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}