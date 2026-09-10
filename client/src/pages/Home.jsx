import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductsAPI, CategoriesAPI } from '../api/endpoints';
import { ProductCard } from '../components/ProductCard';
import { Bottle } from '../components/Bottle';
import { ShieldIcon, TruckIcon, ReturnIcon } from '../components/Icons';

const PROMISES = [
  {
    Icon: ShieldIcon,
    title: 'Authentic stock only',
    body: 'Sourced from authorised distributors. Batch codes on every bottle.',
  },
  {
    Icon: TruckIcon,
    title: 'Nationwide courier',
    body: 'Tracked door-to-door delivery, or collect from a Pargo point near you.',
  },
  {
    Icon: ReturnIcon,
    title: '14-day returns',
    body: 'Unopened and sealed? Send it back within 14 days for a full refund.',
  },
];

export function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Falls back to the drawn bottle if the hero image is ever missing
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Newest four in stock for the arrivals strip, plus the category list
        const [productData, categoryData] = await Promise.all([
          ProductsAPI.list({ sort: '-createdAt', limit: 4, inStock: true }),
          CategoriesAPI.list(),
        ]);
        if (cancelled) return;
        setProducts(productData.products);
        setCategories(categoryData);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load the collection.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="surface-alt">
        <div className="container-xxl">
          <div className="row align-items-center g-0">
            <div className="col-12 col-lg-6 py-5 py-lg-6 pe-lg-5">
              <p className="eyebrow mb-3">Eau de parfum · South Africa</p>
              <h1 className="display-hero mb-4">The trail a fragrance leaves behind you.</h1>
              <p className="text-muted-gold fs-6 mb-4" style={{ maxWidth: '26rem' }}>
                A small, deliberate collection of amber, oud and floral parfums — bottled at full
                strength, priced without the boutique markup.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Link to="/products" className="btn btn-primary">
                  Shop the collection
                </Link>
                <Link to="/products?inStock=true" className="btn btn-outline-gold">
                  In stock now
                </Link>
              </div>
            </div>

            <div className="col-12 col-lg-6 surface-raised d-flex justify-content-center align-items-center">
              {heroFailed ? (
                <div className="py-5">
                  <Bottle seed="hero" size={220} />
                </div>
              ) : (
                <img
                  src="/images/homepage-hero.webp"
                  alt="The Scentigue collection"
                  onError={() => setHeroFailed(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '20rem' }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-xxl py-5">
          <div className="row g-4">
            {categories.slice(0, 4).map((category) => (
              <div className="col-12 col-sm-6 col-lg-3" key={category._id}>
                <Link
                  to={`/products?category=${category._id}`}
                  className="card card-hover h-100 text-decoration-none p-4 p-lg-5"
                >
                  <span className="eyebrow mb-2">Collection</span>
                  <span className="serif fs-2" style={{ color: 'var(--c-text)' }}>
                    {category.category}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New arrivals */}
      <section className="container-xxl pb-5">
        <div className="d-flex align-items-end justify-content-between mb-4">
          <div>
            <p className="eyebrow mb-2">In stock now</p>
            <h2 className="display-section mb-0">New Arrivals</h2>
          </div>
          <Link to="/products" className="small tracking-wide text-uppercase d-none d-sm-block">
            View all →
          </Link>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border spinner-gold" role="status">
              <span className="visually-hidden">Loading products…</span>
            </div>
          </div>
        ) : (
          <div className="row g-3 g-md-4">
            {products.map((product) => (
              <div className="col-6 col-lg-3" key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delivery band */}
      <section className="surface-raised">
        <div className="container-xxl py-5">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
            <div>
              <h2 className="serif fs-2 mb-2">Spend R550, we deliver free</h2>
              <p className="text-muted-gold mb-0">
                Courier nationwide, 2–4 working days. Under R550, delivery is a flat R95.
              </p>
            </div>
            <Link to="/products" className="btn btn-primary flex-shrink-0">
              Shop the collection
            </Link>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="container-xxl py-5">
        <div className="row g-4 g-lg-5">
          {PROMISES.map(({ Icon, title, body }) => (
            <div className="col-12 col-md-4" key={title}>
              <span style={{ color: 'var(--c-accent)' }}>
                <Icon />
              </span>
              <h3 className="serif fs-3 mt-3 mb-2">{title}</h3>
              <p className="text-muted-gold mb-0">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
