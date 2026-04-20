import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoLogoInstagram, IoLogoFacebook, IoLogoTiktok, IoArrowForward } from 'react-icons/io5';
import { postData } from '../../utils/api';
import toast from 'react-hot-toast';

const LINKS = {
  Shop: [
    { label: 'New Drops',   href: '/collections/new-drops' },
    { label: 'Bestsellers', href: '/collections/bestsellers' },
    { label: 'Sale',        href: '/collections/sale' },
    { label: 'All Products',href: '/shop' },
  ],
  Help: [
    { label: 'Contact Us',  href: '/contact' },
    { label: 'Size Guide',  href: '/about#size-guide' },
    { label: 'Returns',     href: '/returns' },
    { label: 'Track Order', href: '/my-orders' },
  ],
  Company: [
    { label: 'About VibeFit', href: '/about' },
    { label: 'Privacy Policy',href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await postData('/api/user/subscribe', { email: email.trim(), source: 'footer' });
      if (res?.success) {
        toast.success(`Subscribed! Your 10% off code: ${res.couponCode}`);
        setEmail('');
      } else {
        toast.error(res?.message || 'Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-primary text-white mt-20">
      {/* Top row */}
      <div className="container pt-14 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="VibeFit" className="h-9 w-auto brightness-0 invert" />
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            Modern streetwear & lifestyle clothing made for the bold. Nepal-wide delivery.
          </p>
          <div className="flex gap-3">
            {[
              { Icon: IoLogoInstagram, href: 'https://instagram.com', label: 'Instagram' },
              { Icon: IoLogoFacebook,  href: 'https://facebook.com',  label: 'Facebook' },
              { Icon: IoLogoTiktok,    href: 'https://tiktok.com',    label: 'TikTok' },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {Object.entries(LINKS).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{title}</h4>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Email capture */}
      <div className="border-t border-white/10">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Get 10% off your first order</p>
            <p className="text-sm text-gray-400">Join 5,000+ VibeFit members</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2 max-w-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-2.5 rounded-md text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-accent flex items-center gap-2 py-2.5 px-4 shrink-0"
            >
              {submitting ? 'Joining...' : 'Join'} <IoArrowForward size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} VibeFit. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <img src="/esewa-logo.png" alt="eSewa" className="h-5 opacity-70" onError={(e) => { e.target.style.display = 'none'; }} />
            <img src="/khalti-logo.png" alt="Khalti" className="h-5 opacity-70" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-xs text-gray-500">Secure checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
