import { useEffect, useState } from 'react';
import { api } from './api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getProducts()
      .then((res) => {
        setProducts(res.data.products);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, []);

  return (
    <main>
      <h1>SEN371 Store</h1>

      {status === 'loading' && <p>Loading products...</p>}

      {status === 'error' && (
        <div className="error">
          <p>Could not reach the API: {error}</p>
          <p>
            Check that the backend is running (<code>npm run dev</code> in the
            project root) and that it has been seeded (<code>npm run seed</code>).
          </p>
        </div>
      )}

      {status === 'ready' && (
        <>
          <p>{products.length} product(s) from the API.</p>
          <ul className="products">
            {products.map((p) => (
              <li key={p._id}>
                <strong>{p.productName}</strong>
                <span>R{p.price.toFixed(2)}</span>
                <span className={p.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
