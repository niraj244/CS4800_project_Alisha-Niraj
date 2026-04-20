import { useState, useEffect, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';

const MESSAGES = [
  'Free shipping on orders over रु 2,000 across Nepal',
  '30-day free returns — no questions asked',
  'New drops every Friday — follow us @vibefit.np',
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem('vf-bar-dismissed')) {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 4000);
    return () => clearInterval(t);
  }, [visible]);

  const dismiss = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem('vf-bar-dismissed', '1');
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-accent text-white text-xs font-semibold relative overflow-hidden">
      <div className="container flex items-center justify-center py-2 px-8 text-center">
        <span className="transition-all duration-500">{MESSAGES[idx]}</span>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
      >
        <IoClose size={14} />
      </button>
    </div>
  );
}
