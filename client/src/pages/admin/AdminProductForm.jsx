import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProductsAPI, CategoriesAPI } from '../../api/endpoints';
import { ProductImage } from '../../components/ProductImage';
import { formatPrice } from '../../utils/format';

const BLANK = {
  productName: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  image: '',
};

// Mirrors the server's own rules, so obvious mistakes are caught before a
// round trip. The server still validates everything it receives.
function validate(form) {
  const errors = {};

  if (!form.productName.trim()) errors.productName = 'A product name is required.';
  if (!form.description.trim()) errors.description = 'A description is required.';

  if (form.price === '' || Number.isNaN(Number(form.price))) {
    errors.price = 'Enter a price.';
  } else if (Number(form.price) < 0) {
    errors.price = 'Price cannot be negative.';
  }

  if (form.stock === '' || !/^\d+$/.test(String(form.stock))) {
    errors.stock = 'Enter a whole number of units.';
  }

  if (!form.category) errors.category = 'Choose a category.';

  return errors;
}

export function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === undefined;

  const [form, setForm] = useState(BLANK);
  const [categories, setCategories] = useState([]);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const categoryData = await CategoriesAPI.list();
        if (!cancelled) setCategories(categoryData);

        if (!isNew) {
          const product = await ProductsAPI.get(id);
          if (cancelled) return;
          setForm({
            productName: product.productName || '',
            description: product.description || '',
            price: String(product.price ?? ''),
            stock: String(product.stock ?? ''),
            category: product.category?._id || product.category || '',
            image: product.image?.[0] || '',
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load that product.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const errors = validate(form);
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));
  const invalid = (field) => Boolean(touched[field] && errors[field]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (Object.keys(errors).length > 0) {
      setTouched(Object.fromEntries(Object.keys(BLANK).map((k) => [k, true])));
      return;
    }

    const payload = {
      productName: form.productName.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      // Stored as an array; an empty box means no image, not [""]
      image: form.image.trim() ? [form.image.trim()] : [],
    };

    setSaving(true);
    try {
      if (isNew) {
        await ProductsAPI.create(payload);
      } else {
        await ProductsAPI.update(id, payload);
      }
      navigate('/admin/products', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not save that product.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border spinner-gold" role="status">
          <span className="visually-hidden">Loading product…</span>
        </div>
      </div>
    );
  }

  // Preview uses the same component as the storefront, so a broken image URL
  // falls back to the drawn bottle here too.
  const preview = {
    productName: form.productName || 'New product',
    image: form.image ? [form.image] : [],
  };

  return (
    <>
      <Link to="/admin/products" className="btn btn-link-gold btn-sm ps-0 mb-3">
        ← Back to products
      </Link>

      <h1 className="display-page mb-4">{isNew ? 'New product' : 'Edit product'}</h1>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="panel p-3 p-md-4">
              <div className="mb-3">
                <label className="form-label" htmlFor="p-name">
                  Product name
                </label>
                <input
                  id="p-name"
                  className={`form-control${invalid('productName') ? ' is-invalid' : ''}`}
                  value={form.productName}
                  onChange={update('productName')}
                  onBlur={blur('productName')}
                  aria-invalid={invalid('productName')}
                />
                {invalid('productName') && (
                  <div className="invalid-feedback d-block">{errors.productName}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="p-description">
                  Description
                </label>
                <textarea
                  id="p-description"
                  className={`form-control${invalid('description') ? ' is-invalid' : ''}`}
                  rows={4}
                  value={form.description}
                  onChange={update('description')}
                  onBlur={blur('description')}
                  aria-invalid={invalid('description')}
                />
                {invalid('description') && (
                  <div className="invalid-feedback d-block">{errors.description}</div>
                )}
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="p-price">
                    Price (ZAR)
                  </label>
                  <input
                    id="p-price"
                    className={`form-control${invalid('price') ? ' is-invalid' : ''}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={update('price')}
                    onBlur={blur('price')}
                    aria-invalid={invalid('price')}
                  />
                  {invalid('price') && <div className="invalid-feedback d-block">{errors.price}</div>}
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="p-stock">
                    Stock on hand
                  </label>
                  <input
                    id="p-stock"
                    className={`form-control${invalid('stock') ? ' is-invalid' : ''}`}
                    type="number"
                    step="1"
                    min="0"
                    value={form.stock}
                    onChange={update('stock')}
                    onBlur={blur('stock')}
                    aria-invalid={invalid('stock')}
                  />
                  {invalid('stock') && <div className="invalid-feedback d-block">{errors.stock}</div>}
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="p-category">
                    Category
                  </label>
                  <select
                    id="p-category"
                    className={`form-select${invalid('category') ? ' is-invalid' : ''}`}
                    value={form.category}
                    onChange={update('category')}
                    onBlur={blur('category')}
                  >
                    <option value="">Choose…</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.category}
                      </option>
                    ))}
                  </select>
                  {invalid('category') && (
                    <div className="invalid-feedback d-block">{errors.category}</div>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="p-image">
                    Image path
                  </label>
                  <input
                    id="p-image"
                    className="form-control"
                    value={form.image}
                    onChange={update('image')}
                    placeholder="/images/example.webp"
                  />
                  <div className="form-text">
                    A file in client/public/images. Leave blank to use the drawn bottle.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="panel p-3 p-md-4" style={{ position: 'sticky', top: '1.5rem' }}>
              <div className="meta mb-3">Preview</div>
              <ProductImage product={preview} size={90} />

              <div className="mt-3">
                <div style={{ color: 'var(--c-text)' }}>{preview.productName}</div>
                <div className="serif fs-4 mt-1">
                  {form.price === '' ? '—' : formatPrice(Number(form.price) || 0)}
                </div>
                <div className="text-muted-gold small mt-1">
                  {form.stock === '' ? 'Stock not set' : `${form.stock} in stock`}
                </div>
              </div>

              <button className="btn btn-primary w-100 mt-4" type="submit" disabled={saving}>
                {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
              </button>

              <Link to="/admin/products" className="btn btn-link-gold w-100 mt-2">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
