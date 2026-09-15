import { useEffect, useState } from 'react';
import { QueriesAPI } from '../../api/endpoints';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { formatDateTime } from '../../utils/format';

const STATUSES = ['new', 'in-progress', 'resolved'];

export function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await QueriesAPI.listAll();
      setQueries(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (query, status) => {
    setUpdatingId(query._id);
    setError(null);
    setNotice(null);
    try {
      const updated = await QueriesAPI.setStatus(query._id, status);
      setQueries((prev) => prev.map((q) => (q._id === updated._id ? updated : q)));
      setNotice(`"${updated.subject}" marked as ${status}.`);
    } catch (err) {
      setError(err.message || 'Could not update that enquiry.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await QueriesAPI.remove(pendingDelete._id);
      setQueries((prev) => prev.filter((q) => q._id !== pendingDelete._id));
      setNotice(`"${pendingDelete.subject}" was deleted.`);
      setPendingDelete(null);
    } catch (err) {
      setError(err.message || 'Could not delete that enquiry.');
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const open = queries.filter((q) => q.status === 'new').length;

  return (
    <>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <h1 className="display-page mb-0">Enquiries</h1>
        <span className="text-muted-gold small">
          {queries.length} total · {open} unread
        </span>
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

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border spinner-gold" role="status">
            <span className="visually-hidden">Loading enquiries…</span>
          </div>
        </div>
      ) : queries.length === 0 ? (
        <div className="panel p-4 text-center text-muted-gold">
          No messages yet. They will appear here as soon as a visitor uses the
          contact page.
        </div>
      ) : (
        <div className="panel table-responsive">
          <table className="table admin-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Received</th>
                <th>From</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query) => (
                <tr key={query._id}>
                  <td className="text-muted-gold text-nowrap">{formatDateTime(query.createdAt)}</td>
                  <td>
                    <div style={{ color: 'var(--c-text)' }}>{query.name}</div>
                    <a href={`mailto:${query.email}`} className="text-muted-gold small">
                      {query.email}
                    </a>
                  </td>
                  <td style={{ color: 'var(--c-text)' }}>{query.subject}</td>
                  <td className="text-muted-gold" style={{ maxWidth: '18rem' }}>
                    <div className="query-message">{query.message}</div>
                  </td>
                  <td className="text-nowrap">
                    <select
                      className="form-select form-select-sm"
                      value={query.status}
                      disabled={updatingId === query._id}
                      aria-label={`Status for enquiry from ${query.name}`}
                      onChange={(e) => handleStatus(query, e.target.value)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-end text-nowrap">
                    <span
                      className={`query-status query-status--${query.status}`}
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      className="btn btn-link-gold btn-sm p-0 ms-2 text-danger-gold"
                      onClick={() => setPendingDelete(query)}
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
        title="Delete this enquiry?"
        body={`"${pendingDelete?.subject}" from ${pendingDelete?.name} will be removed permanently.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}