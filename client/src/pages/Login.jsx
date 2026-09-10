import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/ErrorBanner';

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
    <div className="auth-page">
      <h1 className="auth-page__title">Sign in</h1>
      <p className="auth-page__subtitle">Track orders and check out faster.</p>

      <ErrorBanner message={error} />

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form__label">
          Email address
          <input
            className="auth-form__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-form__label">
          Password
          <input
            className="auth-form__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button className="auth-form__submit" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-page__switch">
        No account yet? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
