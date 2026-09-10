import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MIN_PASSWORD_LENGTH = 8;

// Three-step meter matching the prototype: length, mixed case, and a
// digit or symbol.
function passwordStrength(password) {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[\d\W]/.test(password)) score += 1;
  return score;
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Strong'];

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const strength = passwordStrength(form.password);
  const passwordTooShort = form.password.length > 0 && form.password.length < MIN_PASSWORD_LENGTH;

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
                <Link to="/login" className="small text-uppercase tracking-wide pb-3 text-muted-gold">
                  Sign in
                </Link>
                <span
                  className="small text-uppercase tracking-wide pb-3"
                  style={{ borderBottom: '2px solid var(--c-accent)' }}
                >
                  Create account
                </span>
              </div>

              <h1 className="display-page mb-2">Create your account</h1>
              <p className="text-muted-gold mb-4">It takes a minute.</p>

              {error && (
                <div className="alert alert-error" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="reg-first">
                      First name
                    </label>
                    <input
                      id="reg-first"
                      className="form-control"
                      value={form.firstName}
                      onChange={update('firstName')}
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="reg-last">
                      Last name
                    </label>
                    <input
                      id="reg-last"
                      className="form-control"
                      value={form.lastName}
                      onChange={update('lastName')}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="reg-email">
                    Email address
                  </label>
                  <input
                    id="reg-email"
                    className="form-control"
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@example.co.za"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label" htmlFor="reg-password">
                    Password
                  </label>
                  <input
                    id="reg-password"
                    className="form-control"
                    type="password"
                    value={form.password}
                    onChange={update('password')}
                    autoComplete="new-password"
                    aria-invalid={passwordTooShort}
                    aria-describedby="reg-password-hint"
                    required
                  />
                </div>

                <div className="d-flex gap-1 mb-2" aria-hidden="true">
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={`strength-bar${strength >= step ? ' strength-bar--on' : ''}`}
                    />
                  ))}
                </div>

                <p id="reg-password-hint" className="form-text mb-4">
                  {form.password
                    ? `${STRENGTH_LABEL[strength] || 'Too short'} — at least ${MIN_PASSWORD_LENGTH} characters.`
                    : `At least ${MIN_PASSWORD_LENGTH} characters.`}
                </p>

                <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
                  {submitting ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="text-muted-gold small mt-4 mb-0">
                New accounts are created as customers. Administrator access is granted separately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
