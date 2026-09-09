import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success('Logged in successfully.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 card-lux overflow-hidden">
        <div className="hidden md:flex flex-col justify-between p-10 bg-ink text-cream relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gold/15 blur-3xl" />
          <div>
            <p className="eyebrow">Belgian</p>
            <p className="font-display text-3xl mt-1">Scent</p>
          </div>
          <div className="relative">
            <p className="font-display italic text-4xl text-gold-2 leading-snug">“Luxury must be<br />comfortable,<br />otherwise it is<br />not luxury.”</p>
            <p className="text-cream/50 text-sm mt-6 tracking-[0.2em] uppercase">A curated fragrance boutique</p>
          </div>
        </div>

        <div className="p-8 sm:p-10 bg-cream">
          <h2 className="font-display text-3xl text-ink">Welcome Back</h2>
          <p className="text-ink/55 mt-1 text-sm">Sign in to continue your collection.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink/80 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input-lux"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink/80 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="input-lux"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={submitting} className="w-full btn-gold text-base disabled:opacity-60">
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-ink/55 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-3 font-semibold hover:text-ink transition-colors">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}