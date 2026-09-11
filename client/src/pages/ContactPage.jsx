import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-dark">
      <div className="contact-dark__left">
        <h1 className="contact-dark__title">Contact us</h1>
        <p className="contact-dark__subtitle">
          Have a question about an order, a product, or just want to say hello?
          We'd love to hear from you.
        </p>

        <div className="contact-dark__info">
          <div className="contact-dark__info-item">
            <span className="contact-dark__info-label">Email</span>
            <span className="contact-dark__info-value">577480@student.belgiumcampus.co.za</span>
          </div>
          <div className="contact-dark__info-item">
            <span className="contact-dark__info-label">Phone</span>
            <span className="contact-dark__info-value">+27 68 550 0830</span>
          </div>
          <div className="contact-dark__info-item">
            <span className="contact-dark__info-label">Hours</span>
            <span className="contact-dark__info-value">Mon–Fri, 08:00 – 17:00 SAST</span>
          </div>
        </div>

      {/*  <div className="contact-dark__socials">
          <span>Follow us</span>
          <div className="contact-dark__social-links">
            <a href="#" className="contact-dark__social-link">Instagram</a>
            <a href="#" className="contact-dark__social-link">Twitter</a>
            <a href="#" className="contact-dark__social-link">Facebook</a>
          </div>
        </div>
        */}
      </div>

      <div className="contact-dark__right">
        {submitted ? (
          <div className="contact-dark__success">
            <h2>Thank you!</h2>
            <p>Your message has been sent. We'll get back to you within 24 hours.</p>
            <Link to="/products" className="contact-dark__back-link">Back to store</Link>
          </div>
        ) : (
          <form className="contact-dark__form" onSubmit={handleSubmit}>
            <div className="contact-dark__form-group">
              <label className="contact-dark__label" htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="contact-dark__input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="contact-dark__form-group">
              <label className="contact-dark__label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="contact-dark__input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="contact-dark__form-group">
              <label className="contact-dark__label" htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                className="contact-dark__input"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="contact-dark__form-group">
              <label className="contact-dark__label" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                className="contact-dark__textarea"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="contact-dark__submit">Send message</button>
          </form>
        )}
      </div>
    </div>
  );
}
