import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ErrorBanner } from './ErrorBanner';
import { useState } from 'react';

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    setError(null);
    try {
      await addItem(product._id);
    } catch (err) {
      setError(err.message || 'Failed to add to cart.');
    } finally {
      setAdding(false);
    }
  };

  const imageUrl = product.image && product.image.length > 0 ? product.image[0] : null;
  const categoryName = product.category?.category || 'Uncategorised';
  const outOfStock = product.stock <= 0;

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card__image">
        {imageUrl ? (
          <img src={imageUrl} alt={product.productName} />
        ) : (
          <div className="product-card__placeholder">No image</div>
        )}
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{categoryName}</span>
        <h3 className="product-card__name">{product.productName}</h3>
        <p className="product-card__price">${product.price.toFixed(2)}</p>
        {outOfStock ? (
          <span className="product-card__out-of-stock">Out of stock</span>
        ) : (
          <span className="product-card__stock">{product.stock} in stock</span>
        )}
        <ErrorBanner message={error} />
        <button
          className="product-card__add-btn"
          onClick={handleAdd}
          disabled={adding || outOfStock}
        >
          {adding ? 'Adding...' : 'Add to cart'}
        </button>
      </div>
    </Link>
  );
}
