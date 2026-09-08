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
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {product.image?.[0] ? (
          <img
            src={product.image[0]}
            alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {product.productName}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-indigo-700">{formatZAR(product.price)}</span>
          {outOfStock ? (
            <span className="text-sm text-red-500 font-medium">Out of Stock</span>
          ) : (
            <button
              onClick={handleAddToCart}
              className="bg-amber-500 hover:bg-amber-600 text-indigo-900 text-sm font-bold px-3 py-1 rounded transition-colors"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
