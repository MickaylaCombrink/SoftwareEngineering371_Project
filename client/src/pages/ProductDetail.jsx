import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatZAR } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.data.product);
      } catch {
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    try {
      await addItem(product._id, quantity);
      toast.success(`${quantity}x ${product.productName} added to cart.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/2 aspect-[4/5] bg-blush arch"></div>
          <div className="w-full md:w-1/2 space-y-4 py-8">
            <div className="h-4 bg-ink/10 rounded w-1/4"></div>
            <div className="h-9 bg-ink/10 rounded w-3/4"></div>
            <div className="h-4 bg-ink/10 rounded w-full"></div>
            <div className="h-6 bg-ink/10 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const outOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gold-3 hover:text-ink mb-8 tracking-wide uppercase transition-colors">
        <span aria-hidden>&larr;</span> Back to products
      </button>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div className="relative">
            <div className="absolute inset-0 rounded-b-[4rem] rounded-t-full bg-gradient-to-b from-gold/30 to-transparent blur-2xl -scale-x-100" />
            <div className="relative bg-blush aspect-[4/5] arch overflow-hidden border border-gold/25 shadow-lux">
              {product.image?.[0] ? (
                <img src={product.image[0]} alt={product.productName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold/60">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="py-2 md:py-6">
          <p className="eyebrow mb-3">Signature Fragrance</p>
          <h1 className="font-display text-3xl md:text-5xl text-ink leading-tight">{product.productName}</h1>

          <p className="font-display text-3xl text-gold-3 mt-6">{formatZAR(product.price)}</p>
          <p className={`mt-2 inline-flex items-center gap-2 chip ${outOfStock ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {outOfStock ? 'Out of Stock' : `${product.stock} in stock`}
          </p>

          <div className="mt-8 border-t border-gold/20 pt-6">
            <p className="eyebrow mb-3">The Story</p>
            <p className="text-ink/70 leading-relaxed text-lg">{product.description}</p>
          </div>

          {!outOfStock && (
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div className="flex items-center rounded-full border border-ink/20 overflow-hidden bg-cream">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center text-ink/70 hover:bg-gold/10 hover:text-gold-3 transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold text-ink" data-testid="quantity">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-12 h-12 flex items-center justify-center text-ink/70 hover:bg-gold/10 hover:text-gold-3 transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="btn-gold text-base flex-1 sm:flex-none sm:px-10"
              >
                Add to Cart
              </button>
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { t: 'Authentic', d: 'Verified & sealed' },
              { t: 'Free delivery', d: 'Orders over R500' },
              { t: 'Returns', d: '7-day exchange' },
            ].map((r) => (
              <div key={r.t} className="card-lux shadow-none p-4 text-center">
                <p className="font-display text-ink">{r.t}</p>
                <p className="text-xs text-ink/50 mt-0.5">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}