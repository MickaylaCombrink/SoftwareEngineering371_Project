import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      // Return the user to whatever they were trying to reach
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      // ApiError carries the server's wording, including the 429
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="surface-deep">
        <div className="container-xxl py-5">
          <div className="serif fs-2 tracking-brand">SCENTIGUE</div>
          <p className="eyebrow mt-2 mb-0">Account</p>
        </div>
      </div>

      <div className="container-xxl py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="panel p-4 p-md-5">
              <div className="d-flex gap-4 border-bottom mb-4" style={{ borderColor: 'var(--c-border)' }}>
                <span
                  className="small text-uppercase tracking-wide pb-3"
                  style={{ borderBottom: '2px solid var(--c-accent)' }}
                >
                  Sign in
                </span>
                <Link to="/register" className="small text-uppercase tracking-wide pb-3 text-muted-gold">
                  Create account
                </Link>
              </div>

              <h1 className="display-page mb-2">Welcome back</h1>
              <p className="text-muted-gold mb-4">Track orders and check out faster.</p>

              {error && (
                <div className="alert alert-error" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label" htmlFor="login-email">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.co.za"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    id="login-password"
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <div className="divider-label my-4">New here</div>

              <Link to="/register" className="btn btn-outline-gold w-100">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
