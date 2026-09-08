import { useCart } from '../context/CartContext';
import { formatZAR } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  const handleUpdate = async (qty) => {
    try {
      await updateQuantity(item.productId, qty);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity.');
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem(item.productId);
      toast.success('Item removed from cart.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item.');
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
        <p className="text-sm text-gray-500">{formatZAR(item.unitPrice)} each</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleUpdate(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => handleUpdate(item.quantity + 1)}
          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
        >
          +
        </button>
      </div>

      <div className="text-right min-w-[80px]">
        <p className="font-semibold text-indigo-700">{formatZAR(item.unitPrice * item.quantity)}</p>
        <button
          onClick={handleRemove}
          className="text-sm text-red-500 hover:text-red-700 mt-1"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
