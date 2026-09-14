import { useEffect, useState } from 'react';
import { CategoriesAPI, ProductsAPI } from '../../api/endpoints';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

const BLANK = { category: '', description: '' };

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // One form serves both create and edit; editingId decides which.
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [categoryData, products] = await Promise.all([
        CategoriesAPI.list(),
        ProductsAPI.listAll(),
      ]);
      setCategories(categoryData);

      // How many products sit in each category, so deleting one is an
      // informed decision rather than a guess.
      const tally = {};
      products.forEach((p) => {
        const id = p.category?._id || p.category;
        if (id) tally[id] = (tally[id] || 0) + 1;
      });
      setCounts(tally);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const startEdit = (category) => {
    setEditingId(category._id);
    setForm({ category: category.category, description: category.description || '' });
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(BLANK);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.category.trim()) {
      setError('A category name is required.');
      return;
    }

    const payload = {
      category: form.category.trim(),
      description: form.description.trim(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await CategoriesAPI.update(editingId, payload);
        setNotice(`"${payload.category}" was updated.`);
      } else {
        await CategoriesAPI.create(payload);
        setNotice(`"${payload.category}" was created.`);
      }
      cancelEdit();
      await load();
    } catch (err) {
      // A duplicate name hits the unique index and comes back as a 409
      setError(err.message || 'Could not save that category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await CategoriesAPI.remove(pendingDelete._id);
      setNotice(`"${pendingDelete.category}" was deleted.`);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(err.message || 'Could not delete that category.');
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const inUse = pendingDelete ? counts[pendingDelete._id] || 0 : 0;

  return (
    <>
      <h1 className="display-page mb-4">Categories</h1>

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

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <form className="panel p-3 p-md-4" onSubmit={handleSubmit} noValidate>
            <h2 className="serif fs-3 mb-3">{editingId ? 'Edit category' : 'New category'}</h2>

            <div className="mb-3">
              <label className="form-label" htmlFor="c-name">
                Name
              </label>
              <input
                id="c-name"
                className="form-control"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="c-description">
                Description
              </label>
              <textarea
                id="c-description"
                className="form-control"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <button className="btn btn-primary w-100" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create category'}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-link-gold w-100 mt-2"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="col-12 col-lg-7">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border spinner-gold" role="status">
                <span className="visually-hidden">Loading categories…</span>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="panel p-4 text-center text-muted-gold">No categories yet.</div>
          ) : (
            <div className="panel table-responsive">
              <table className="table admin-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Products</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td>
                        <div style={{ color: 'var(--c-text)' }}>{category.category}</div>
                        {category.description && (
                          <div className="text-muted-gold small mt-1">{category.description}</div>
                        )}
                      </td>
                      <td className="text-muted-gold">{counts[category._id] || 0}</td>
                      <td className="text-end text-nowrap">
                        <button
                          type="button"
                          className="btn btn-link-gold btn-sm p-0"
                          onClick={() => startEdit(category)}
                        >
                          Edit
                        </button>
                        <span className="text-muted-gold mx-2">·</span>
                        <button
                          type="button"
                          className="btn btn-link-gold btn-sm p-0 text-danger-gold"
                          onClick={() => setPendingDelete(category)}
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
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this category?"
        body={
          inUse > 0
            ? `"${pendingDelete?.category}" still has ${inUse} product${inUse === 1 ? '' : 's'} in it. Those products stay in the catalogue but will show no category until you reassign them.`
            : `"${pendingDelete?.category}" has no products in it and can be safely removed.`
        }
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
