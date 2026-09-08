import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const body = { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password };
      await register(body);
      toast.success('Account created successfully.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 card-lux overflow-hidden">
        <div className="hidden md:flex flex-col justify-between p-10 bg-ink text-cream relative overflow-hidden order-last">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative mt-auto">
            <p className="font-display italic text-3xl text-gold-2 leading-snug">“A perfume is a<br />silent story worn<br />close to the skin.”</p>
            <p className="text-cream/50 text-sm mt-6 tracking-[0.2em] uppercase">Join the Maison</p>
          </div>
          <div className="relative">
            <p className="eyebrow">Fresh member?</p>
            <p className="text-cream/70 text-sm mt-2">Create your account and unlock member pricing, order tracking and first access to limited editions.</p>
          </div>
        </div>

        <div className="p-8 sm:p-10 bg-cream">
          <h2 className="font-display text-3xl text-ink">Create Account</h2>
          <p className="text-ink/55 mt-1 text-sm">Begin your fragrance journey with us.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-ink/80 mb-1.5">First Name</label>
                <input id="firstName" type="text" name="firstName" required value={form.firstName} onChange={handleChange} className="input-lux" placeholder="Nathi" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-ink/80 mb-1.5">Last Name</label>
                <input id="lastName" type="text" name="lastName" required value={form.lastName} onChange={handleChange} className="input-lux" placeholder="Mathenjwa" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink/80 mb-1.5">Email</label>
              <input id="email" type="email" name="email" required value={form.email} onChange={handleChange} className="input-lux" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink/80 mb-1.5">Password</label>
              <input id="password" type="password" name="password" required minLength={8} value={form.password} onChange={handleChange} className="input-lux" placeholder="Minimum 8 characters" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink/80 mb-1.5">Confirm Password</label>
              <input id="confirmPassword" type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} className="input-lux" placeholder="Repeat your password" />
            </div>
            <button type="submit" disabled={submitting} className="w-full btn-gold text-base disabled:opacity-60">
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-sm text-ink/55 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-3 font-semibold hover:text-ink transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}