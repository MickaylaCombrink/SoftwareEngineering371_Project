import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductsAPI } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { Spinner } from '../components/Spinner';
import { ErrorBanner } from '../components/ErrorBanner';

export function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    setQuantity(1);
    setAddedMessage('');
    ProductsAPI.get(id)
      .then(setProduct)
      .catch((err) => setError(err.message || 'Failed to load product.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    setError(null);
    setAddedMessage('');
    try {
      await addItem(id, quantity);
      setAddedMessage(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart.`);
    } catch (err) {
      setError(err.message || 'Failed to add to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!product) return <ErrorBanner message="Product not found." />;

  const outOfStock = product.stock <= 0;
  const categoryName = product.category?.category || 'Uncategorised';
  const imageUrl = product.image && product.image.length > 0 ? product.image[0] : null;

  return (
    <div className="product-detail">
      <Link to="/" className="product-detail__back">&larr; Back to store</Link>

      <div className="product-detail__layout">
        <div className="product-detail__image">
          {imageUrl ? (
            <img src={imageUrl} alt={product.productName} />
          ) : (
            <div className="product-detail__placeholder">No image available</div>
          )}
        </div>

        <div className="product-detail__info">
          <span className="product-detail__category">{categoryName}</span>
          <h1 className="product-detail__name">{product.productName}</h1>
          <p className="product-detail__price">${product.price.toFixed(2)}</p>
          <p className="product-detail__description">{product.description}</p>

          {outOfStock ? (
            <p className="product-detail__out-of-stock">Out of stock</p>
          ) : (
            <>
              <p className="product-detail__stock">{product.stock} available</p>
              <div className="product-detail__add">
                <label className="product-detail__qty-label">
                  Quantity:
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
                    className="product-detail__qty-input"
                  />
                </label>
                <button
                  className="product-detail__add-btn"
                  onClick={handleAdd}
                  disabled={adding}
                >
                  {adding ? 'Adding...' : 'Add to cart'}
                </button>
              </div>
              {addedMessage && <p className="product-detail__success">{addedMessage}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
