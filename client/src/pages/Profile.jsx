import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await refreshUser();
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8">
        <p className="eyebrow mb-2">Member profile</p>
        <h1 className="font-display text-4xl text-ink">My Profile</h1>
      </header>

      <div className="card-lux p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-ink/80 mb-1.5">First Name</label>
              <input id="firstName" type="text" name="firstName" value={form.firstName} onChange={handleChange} className="input-lux" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-ink/80 mb-1.5">Last Name</label>
              <input id="lastName" type="text" name="lastName" value={form.lastName} onChange={handleChange} className="input-lux" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink/80 mb-1.5">Email</label>
            <input id="email" type="email" name="email" value={form.email} disabled className="input-lux bg-ink/5 text-ink/40 border-ink/10" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-ink/80 mb-1.5">Phone</label>
            <input id="phone" type="tel" name="phone" value={form.phone} onChange={handleChange} className="input-lux" placeholder="+27 00 000 0000" />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-60">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="card-lux p-6">
        <h2 className="font-display text-2xl text-ink mb-4">Account Details</h2>
        <div className="space-y-2 text-sm text-ink/70">
          <p>Role: <span className="font-medium capitalize text-ink">{user?.role}</span></p>
          <p>Member since: <span className="text-ink">{new Date(user?.createdAt).toLocaleDateString()}</span></p>
        </div>
      </div>
    </div>
  );
}