import { useState } from 'react';
import SEO from '../../components/SEO';
import { IoMailOutline, IoLogoInstagram, IoLogoFacebook } from 'react-icons/io5';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <SEO title="Contact Us — VibeFit" description="Get in touch with the VibeFit team." url="/contact" />

      <div className="container py-16 max-w-2xl">
        <h1 className="font-display font-bold text-4xl mb-2">Contact Us</h1>
        <p className="text-text-muted mb-10">We usually respond within 24 hours on weekdays.</p>

        {sent ? (
          <div className="bg-success/10 border border-success/30 text-success rounded-xl p-8 text-center">
            <p className="text-2xl mb-2">✓</p>
            <h2 className="font-bold text-xl mb-1">Message sent!</h2>
            <p className="text-sm">We'll get back to you at {form.email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input w-full"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input w-full"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="input w-full resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button type="submit" className="btn-accent w-full py-3">Send Message</button>
          </form>
        )}

        <div className="mt-12 pt-10 border-t border-border space-y-4">
          <h3 className="font-semibold">Other ways to reach us</h3>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <IoMailOutline size={18} className="text-accent" />
            <span>hello@vibefit.com.np</span>
          </div>
          <div className="flex gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors">
              <IoLogoInstagram size={18} /> Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors">
              <IoLogoFacebook size={18} /> Facebook
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
