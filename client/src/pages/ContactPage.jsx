import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QueriesAPI } from '../api/endpoints';

const SUBJECTS = [
  'Order enquiries',
  'A question about a product',
  'Fragrance advice',
  'Gift wrapping & occasions',
  'Something else entirely',
];

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await QueriesAPI.create(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Your note could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <header className="contact-page__hero">
        <p className="contact-page__eyebrow">Scentigue · Concierge</p>
        <h1 className="contact-page__title">Write to us in confidence</h1>
        <p className="contact-page__hero-sub">
          A question about an order, a scent you are chasing, or the right gift —
          the boutique replies within one business day.
        </p>
      </header>

      <div className="contact-page__body">
        <aside className="contact-page__aside">
          <div className="contact-card">
            <p className="contact-card__title">The boutique</p>

            <div className="contact-card__item">
              <span className="contact-card__label">Correspondence</span>
              <span className="contact-card__value">577480@student.belgiumcampus.ac.za</span>
            </div>
            <div className="contact-card__item">
              <span className="contact-card__label">Telephone</span>
              <span className="contact-card__value">+27 68 550 0830</span>
            </div>
            <div className="contact-card__item">
              <span className="contact-card__label">Hours</span>
              <span className="contact-card__value">Monday – Friday · 08:00 – 17:00 SAST</span>
            </div>
          </div>

          <div className="contact-card contact-card--muted">
            <p className="contact-card__title">Good to know</p>
            <p className="contact-card__note">
              Orders leave the boutique within two working days. Fragrance advice
              and gifting questions are always welcome — we love those.
            </p>
          </div>
        </aside>

        <section className="contact-panel">
          {submitted ? (
            <div className="contact-success">
              <span className="contact-success__mark" aria-hidden="true">
                ✓
              </span>
              <h2 className="contact-success__title">Your note has arrived</h2>
              <span className="contact-success__rule" aria-hidden="true" />
              <p className="contact-success__body">
                Thank you — the concierge desk has it, and will reply to you
                within one business day.
              </p>
              <Link to="/products" className="contact-success__link">
                Continue to the collection
              </Link>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <p className="contact-form__heading">Send a note</p>

              {error && (
                <div className="contact-form__error" role="alert">
                  {error}
                </div>
              )}

              <div className="contact-form__row">
                <div className="contact-field">
                  <label className="contact-field__label" htmlFor="name">
                    Your name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="contact-field__input"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="contact-field">
                  <label className="contact-field__label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="contact-field__input"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="contact-field">
                <label className="contact-field__label" htmlFor="subject">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="contact-field__input contact-field__select"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="contact-field">
                <label className="contact-field__label" htmlFor="message">
                  Your message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="contact-field__textarea"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="contact-form__submit" disabled={sending}>
                {sending ? 'Sending your note…' : 'Send your note'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}