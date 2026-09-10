import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bottle } from '../components/Bottle';
import { SearchIcon } from '../components/Icons';

export function NotFound() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  return (
    <div className="container-xxl py-5">
      <div className="row align-items-center g-5">
        <div className="col-12 col-lg-6">
          <div
            className="serif mb-2"
            style={{ fontSize: 'clamp(5rem, 16vw, 8.75rem)', lineHeight: 0.9, color: 'var(--c-text-ghost)' }}
            aria-hidden="true"
          >
            404
          </div>

          <h1 className="display-page mb-3">This page has evaporated</h1>

          <p className="text-muted-gold fs-6 mb-4" style={{ maxWidth: '28rem' }}>
            The link may be old, or the product might have sold out and been removed. Try a search,
            or start again from the collection.
          </p>

          <form className="d-flex mb-4" onSubmit={handleSearch} style={{ maxWidth: '29rem' }}>
            <label className="visually-hidden" htmlFor="notfound-search">
              Search for a fragrance
            </label>
            <span
              className="d-flex align-items-center px-3"
              style={{
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border-input)',
                borderRight: 'none',
                color: 'var(--c-text-dim)',
              }}
            >
              <SearchIcon size={18} />
            </span>
            <input
              id="notfound-search"
              className="form-control"
              style={{ borderLeft: 'none', minWidth: 0 }}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search for a fragrance"
            />
            <button className="btn btn-primary flex-shrink-0" type="submit">
              Search
            </button>
          </form>

          <div className="d-flex flex-column flex-sm-row gap-3">
            <Link to="/" className="btn btn-primary">
              Back to home
            </Link>
            <Link to="/products" className="btn btn-outline-gold">
              Shop the collection
            </Link>
          </div>
        </div>

        <div className="col-12 col-lg-6 d-flex justify-content-center">
          <Bottle seed="404" size={200} muted />
        </div>
      </div>
    </div>
  );
}
