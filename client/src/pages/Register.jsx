import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/ErrorBanner';

const MIN_PASSWORD_LENGTH = 8;

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Checked here too, so the user sees it without a round trip
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      // 409 when the email is already registered
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <h1 className="auth-page__title">Create an account</h1>
      <p className="auth-page__subtitle">It takes a minute.</p>

      <ErrorBanner message={error} />

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form__row">
          <label className="auth-form__label">
            First name
            <input
              className="auth-form__input"
              value={form.firstName}
              onChange={update('firstName')}
              autoComplete="given-name"
              required
            />
          </label>
          <label className="auth-form__label">
            Last name
            <input
              className="auth-form__input"
              value={form.lastName}
              onChange={update('lastName')}
              autoComplete="family-name"
              required
            />
          </label>
        </div>

        <label className="auth-form__label">
          Email address
          <input
            className="auth-form__input"
            type="email"
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-form__label">
          Password
          <input
            className="auth-form__input"
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
          <span className="auth-form__hint">At least {MIN_PASSWORD_LENGTH} characters.</span>
        </label>

        <button className="auth-form__submit" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-page__switch">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
