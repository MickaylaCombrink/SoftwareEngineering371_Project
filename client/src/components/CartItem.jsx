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
    <div className="flex items-center gap-4 py-5 border-b border-gold/15 last:border-b-0">
      <div className="w-20 h-20 rounded-2xl bg-blush overflow-hidden flex-shrink-0 flex items-center justify-center text-gold/60 border border-gold/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-display text-base text-ink truncate">{item.name}</h4>
        <p className="text-sm text-ink/55">{formatZAR(item.unitPrice)} each</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleUpdate(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="w-9 h-9 rounded-full border border-ink/20 flex items-center justify-center text-ink/70 hover:border-gold hover:text-gold-3 hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          -
        </button>
        <span className="w-9 text-center font-medium text-ink">{item.quantity}</span>
        <button
          onClick={() => handleUpdate(item.quantity + 1)}
          className="w-9 h-9 rounded-full border border-ink/20 flex items-center justify-center text-ink/70 hover:border-gold hover:text-gold-3 hover:bg-gold/10 transition-colors"
        >
          +
        </button>
      </div>

      <div className="text-right min-w-[84px]">
        <p className="font-display text-base font-semibold text-gold-3">{formatZAR(item.unitPrice * item.quantity)}</p>
        <button onClick={handleRemove} className="text-sm text-ink/40 hover:text-red-600 mt-0.5 transition-colors">
          Remove
        </button>
      </div>
    </div>
  );
}