import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductsAPI } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { formatPrice } from '../utils/format';

const DETAIL_SECTIONS = [
  {
    title: 'Delivery & returns',
    body: 'Courier nationwide, 2–4 working days. Free over R550, otherwise a flat R95. Unopened and sealed items can be returned within 14 days.',
  },
  {
    title: 'Authenticity',
    body: 'Sourced from authorised distributors only. Every bottle carries a batch code you can verify.',
  },
];

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState('Fragrance notes');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setQuantity(1);
    setAdded(false);

    async function load() {
      try {
        const found = await ProductsAPI.get(id);
        if (cancelled) return;
        setProduct(found);

        // Same category, minus this product, for the "you may also like" row
        const categoryId = found.category?._id || found.category;
        if (categoryId) {
          const { products } = await ProductsAPI.list({ category: categoryId, limit: 4 });
          if (!cancelled) setRelated(products.filter((p) => p._id !== found._id).slice(0, 3));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'That product could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    setError(null);
    try {
      await addItem(product._id, quantity);
      setAdded(true);
    } catch (err) {
      setError(err.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container-xxl py-5 d-flex justify-content-center">
        <div className="spinner-border spinner-gold" role="status">
          <span className="visually-hidden">Loading product…</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-xxl py-5 text-center">
        <h1 className="display-page mb-3">Product not found</h1>
        <p className="text-muted-gold mb-4">{error || 'This item may have been removed.'}</p>
        <Link to="/products" className="btn btn-primary">
          Back to the collection
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const categoryName = product.category?.category || 'Fragrance';

  return (
    <div className="container-xxl py-4 py-lg-5">
      <button type="button" className="btn btn-link-gold btn-sm ps-0 mb-3" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="row g-4 g-lg-5 align-items-start">
        {/* Imagery */}
        <div className="col-12 col-lg-6">
          <ProductImage product={product} size={200} className="border" />
        </div>

        {/* Detail */}
        <div className="col-12 col-lg-6">
          <p className="eyebrow mb-2">{categoryName} · Eau de parfum</p>
          <h1 className="display-page mb-3">{product.productName}</h1>

          <div className="d-flex align-items-baseline gap-3 mb-4">
            <span className="serif" style={{ fontSize: '2.375rem' }}>
              {formatPrice(product.price)}
            </span>
            <span className="text-muted-gold small">incl. VAT</span>
          </div>

          <p className="text-muted-gold fs-6 mb-4">{product.description}</p>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          {added && (
            <div className="alert alert-success d-flex justify-content-between align-items-center" role="status">
              <span>Added to your cart.</span>
              <Link to="/cart" className="small text-uppercase tracking-wide">
                View cart →
              </Link>
            </div>
          )}

          <div className="d-flex flex-column flex-sm-row gap-3 mb-3">
            <div className="qty-group">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || outOfStock}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock || outOfStock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary flex-grow-1"
              onClick={handleAdd}
              disabled={adding || outOfStock}
            >
              {outOfStock
                ? 'Out of stock'
                : adding
                  ? 'Adding…'
                  : isAuthenticated
                    ? `Add to cart — ${formatPrice(product.price * quantity)}`
                    : 'Sign in to buy'}
            </button>
          </div>

          <div className="d-flex align-items-center gap-2 my-4">
            <span className={`stock-dot${outOfStock ? ' stock-dot--out' : ''}`} />
            <span className="small">
              {outOfStock ? 'Currently unavailable' : `${product.stock} in stock`}
            </span>
            {!outOfStock && (
              <span className="text-muted-gold small">· ships within 1 working day</span>
            )}
          </div>

          {/* Accordion */}
          <div className="border-top" style={{ borderColor: 'var(--c-border)' }}>
            {DETAIL_SECTIONS.map((section) => {
              const open = openSection === section.title;
              return (
                <div
                  key={section.title}
                  className="border-bottom"
                  style={{ borderColor: 'var(--c-border)' }}
                >
                  <button
                    type="button"
                    className="btn btn-link-gold w-100 d-flex justify-content-between align-items-center py-3 px-0"
                    onClick={() => setOpenSection(open ? null : section.title)}
                    aria-expanded={open}
                  >
                    <span style={{ color: 'var(--c-text)' }}>{section.title}</span>
                    <span aria-hidden="true">{open ? '−' : '+'}</span>
                  </button>
                  {open && <p className="text-muted-gold small pb-3 mb-0">{section.body}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="pt-5 mt-4">
          <h2 className="display-section mb-4">You may also like</h2>
          <div className="row g-3 g-md-4">
            {related.map((item) => (
              <div className="col-6 col-lg-4" key={item._id}>
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
