import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { formatZAR } from '../utils/formatCurrency';

const statusStyles = {
  Pending: 'bg-gold/15 text-gold-3 border border-gold/30',
  Shipping: 'bg-blue-50 text-blue-700 border border-blue-200',
  Delivered: 'bg-green-50 text-green-700 border border-green-200',
};

export default function Orders() {
  const { orders, loading, error } = useOrders();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-5">
          <div className="h-9 bg-ink/10 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-blush rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8">
        <p className="eyebrow mb-2">Your fragrance journey</p>
        <h1 className="font-display text-4xl text-ink">My Orders</h1>
      </header>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink/55 text-lg mb-6">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-gold text-base">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block card-lux p-5 hover:-translate-y-0.5 transition-transform duration-300"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="eyebrow text-[0.6rem]">Order</p>
                  <p className="font-display text-xl text-ink mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-ink/55 mt-1">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} &middot; {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block chip ${statusStyles[order.orderStatus] || 'bg-ink/5 text-ink/60'}`}>
                    {order.orderStatus}
                  </span>
                  <p className="font-display text-xl font-semibold text-gold-3 mt-2">{formatZAR(order.totalPrice)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}