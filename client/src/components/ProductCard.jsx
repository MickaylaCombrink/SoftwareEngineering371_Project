import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatZAR } from '../utils/formatCurrency';
import { getProductBrand } from '../utils/brand';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const outOfStock = product.stock === 0;
  const brand = getProductBrand(product.productName);

  const hasSale = !outOfStock && product.oldPrice && product.oldPrice > product.price;
  const discountPct = hasSale ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.');
      return;
    }
    try {
      await addItem(product._id, 1);
      toast.success(`${product.productName} added to cart.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart.');
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="group card-lux overflow-hidden flex flex-col hover:-translate-y-1.5 transition-transform duration-300">
      <div className="aspect-square bg-blush overflow-hidden relative">
        {product.image?.[0] ? (
          <>
            <img
              src={product.image[0]}
              alt={product.productName}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gold/60">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
          {outOfStock ? (
            <span className="chip bg-ink/90 text-cream border border-ink">Out of Stock</span>
          ) : hasSale ? (
            <span className="chip bg-[#9b2c2c] text-cream border border-[#9b2c2c]">Save {discountPct}%</span>
          ) : null}
        </div>

        <div className="absolute inset-x-3 bottom-3">
          {outOfStock ? (
            <span className="w-full flex justify-center py-2.5 rounded-full bg-cream/90 backdrop-blur-sm text-sm font-semibold text-ink/60">
              Sold Out
            </span>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 rounded-full bg-ink text-cream text-sm font-semibold tracking-wide hover:bg-gold hover:text-ink transition-colors shadow-lux md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:transition-all md:duration-300"
            >
              Quick Add &middot; {formatZAR(product.price)}
            </button>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {brand && (
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-ink/45 font-semibold">{brand}</p>
        )}
        <h3 className="font-display text-lg text-ink group-hover:text-gold-3 transition-colors leading-snug truncate">
          {product.productName}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          {hasSale && (
            <span className="text-sm text-ink/40 line-through">{formatZAR(product.oldPrice)}</span>
          )}
          <span className="font-display text-xl font-semibold text-gold-3">{formatZAR(product.price)}</span>
        </div>
      </div>
    </Link>
  );
}