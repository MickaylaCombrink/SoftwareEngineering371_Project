import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductsAPI, CategoriesAPI } from '../../api/endpoints';
import { ProductImage } from '../../components/ProductImage';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { formatPrice } from '../../utils/format';

const LOW_STOCK_AT = 10;

function stockBadge(stock) {
  if (stock <= 0) return <span className="badge badge--danger">Out of stock</span>;
  if (stock <= LOW_STOCK_AT) return <span className="badge badge--warn">{stock} low</span>;
  return <span className="badge badge--ok">{stock}</span>;
}

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        ProductsAPI.listAll(),
        CategoriesAPI.list(),
      ]);
      setProducts(productData);
      setCategories(categoryData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load products.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Filtered in the browser: the whole catalogue is already loaded, so this
  // stays instant and avoids a request per keystroke.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesTerm = !term || p.productName.toLowerCase().includes(term);
      const id = p.category?._id || p.category;
      const matchesCategory = !categoryId || String(id) === categoryId;
      return matchesTerm && matchesCategory;
    });
  }, [products, search, categoryId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await ProductsAPI.remove(pendingDelete._id);
      setProducts((list) => list.filter((p) => p._id !== pendingDelete._id));
      setNotice(`"${pendingDelete.productName}" was deleted.`);
      setPendingDelete(null);
    } catch (err) {
      setError(err.message || 'Could not delete that product.');
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <h1 className="display-page mb-1">Products</h1>
          <p className="text-muted-gold mb-0 small">
            {visible.length === products.length
              ? `${products.length} in the catalogue`
              : `${visible.length} of ${products.length} shown`}
          </p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary btn-sm">
          + New product
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-7">
          <label className="visually-hidden" htmlFor="admin-product-search">
            Search products
          </label>
          <input
            id="admin-product-search"
            className="form-control"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-5">
          <label className="visually-hidden" htmlFor="admin-product-category">
            Filter by category
          </label>
          <select
            id="admin-product-category"
            className="form-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border spinner-gold" role="status">
            <span className="visually-hidden">Loading products…</span>
          </div>
        </div>
      ) : visible.length === 0 ? (
        <div className="panel p-4 text-center text-muted-gold">
          No products match that filter.
        </div>
      ) : (
        <div className="panel table-responsive">
          <table className="table admin-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Product</th>
                <th className="d-none d-md-table-cell">Category</th>
                <th className="text-end">Price</th>
                <th>Stock</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <span className="admin-thumb">
                        <ProductImage product={product} size={26} />
                      </span>
                      <Link
                        to={`/admin/products/${product._id}`}
                        className="text-decoration-none"
                        style={{ color: 'var(--c-text)' }}
                      >
                        {product.productName}
                      </Link>
                    </div>
                  </td>
                  <td className="d-none d-md-table-cell text-muted-gold">
                    {product.category?.category || '—'}
                  </td>
                  <td className="text-end">{formatPrice(product.price)}</td>
                  <td>{stockBadge(product.stock)}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/products/${product._id}`} className="small">
                      Edit
                    </Link>
                    <span className="text-muted-gold mx-2">·</span>
                    <button
                      type="button"
                      className="btn btn-link-gold btn-sm p-0 text-danger-gold"
                      onClick={() => setPendingDelete(product)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this product?"
        body={`"${pendingDelete?.productName}" will be removed from the catalogue. Orders that already contain it keep their own copy of the name and price, so order history is unaffected.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
