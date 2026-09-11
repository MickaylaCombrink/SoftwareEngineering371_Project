import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductImage } from './ProductImage';
import { formatPrice } from '../utils/format';

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  const categoryName = product.category?.category || 'Fragrance';
  const outOfStock = product.stock <= 0;

  const handleAdd = async (e) => {
    // The whole card is a link to the detail page, so the button must not
    // navigate as well.
    e.preventDefault();
    e.stopPropagation();

    setAdding(true);
    setError(null);
    try {
      await addItem(product._id);
    } catch (err) {
      setError(err.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="card card-hover h-100">
      <Link to={`/products/${product._id}`} className="text-decoration-none">
        <ProductImage product={product} size={110} />
      </Link>

      <div className="card-body d-flex flex-column p-3 p-md-4">
        <span className="meta">{categoryName}</span>

        <Link to={`/products/${product._id}`} className="text-decoration-none">
          <h3 className="fs-6 fw-normal mt-2 mb-0" style={{ color: 'var(--c-text)' }}>
            {product.productName}
          </h3>
        </Link>

        <p className="serif fs-4 mt-2 mb-3">{formatPrice(product.price)}</p>

        <div className="stock mb-3 d-flex align-items-center gap-2 small">
          <span className={`stock-dot${outOfStock ? ' stock-dot--out' : ''}`} />
          <span className="text-muted-gold">
            {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
          </span>
        </div>

        {error && (
          <div className="alert alert-error py-2 px-3 small mb-3" role="alert">
            {error}
          </div>
        )}

        <button
          type="button"
          className="btn btn-outline-gold btn-sm w-100 mt-auto"
          onClick={handleAdd}
          disabled={adding || outOfStock}
        >
          {adding ? 'Adding…' : isAuthenticated ? 'Add to cart' : 'Sign in to buy'}
        </button>
      </div>
    </div>
  );
}
