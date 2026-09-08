import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatZAR } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const outOfStock = product.stock === 0;

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
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg text-ink group-hover:text-gold-3 transition-colors leading-snug truncate">
          {product.productName}
        </h3>
        <p className="text-sm text-ink/55 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gold/15">
          <span className="font-display text-xl font-semibold text-gold-3">{formatZAR(product.price)}</span>
          {outOfStock ? (
            <span className="chip bg-ink/5 text-ink/50 border border-ink/10">Out of Stock</span>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-ink bg-gold/15 hover:bg-gold hover:text-ink transition-colors border border-gold/30"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}