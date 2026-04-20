import { useContext, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import { IoBagOutline, IoPersonOutline, IoHeartOutline, IoSearchOutline, IoMenuOutline, IoCloseOutline } from 'react-icons/io5';
import AnnouncementBar from '../AnnouncementBar';

export default function Header() {
  const ctx = useContext(MyContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const cartCount = ctx.cartData?.length || 0;
  const wishCount = ctx.myListData?.length || 0;

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      setMobileOpen(false);
    }
  }, [searchVal, navigate]);

  const NAV_LINKS = [
    { label: 'Shop',        href: '/shop' },
    { label: 'New Drops',   href: '/collections/new-drops' },
    { label: 'Bestsellers', href: '/collections/bestsellers' },
    { label: 'Sale',        href: '/collections/sale' },
    { label: 'About',       href: '/about' },
  ];

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14 md:h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0" aria-label="VibeFit home">
            <img src="/logo.svg" alt="VibeFit" className="h-8 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="text-sm font-medium text-text-primary hover:text-accent px-3 py-2 rounded-md transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <input
                type="search"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search products..."
                className="input pl-10 py-2 text-sm h-9"
              />
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => ctx.setOpenSearchPanel?.((p) => !p)}
              className="md:hidden p-2 rounded-md hover:bg-surface-alt transition-colors"
              aria-label="Search"
            >
              <IoSearchOutline size={20} />
            </button>

            <Link to="/my-list" className="relative p-2 rounded-md hover:bg-surface-alt transition-colors" aria-label={`Wishlist (${wishCount})`}>
              <IoHeartOutline size={20} />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {wishCount}
                </span>
              )}
            </Link>

            {ctx.isLogin ? (
              <Link to="/my-account" className="p-2 rounded-md hover:bg-surface-alt transition-colors" aria-label="My account">
                <IoPersonOutline size={20} />
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex btn-accent text-xs py-2 px-4 rounded-md">
                Sign in
              </Link>
            )}

            <button
              onClick={ctx.toggleCartPanel(true)}
              className="relative p-2 rounded-md hover:bg-surface-alt transition-colors"
              aria-label={`Cart (${cartCount} items)`}
            >
              <IoBagOutline size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-md hover:bg-surface-alt transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <IoCloseOutline size={22} /> : <IoMenuOutline size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white animate-fade-in">
            <nav className="container py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium hover:text-accent px-3 py-3 border-b border-border/50 last:border-0 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              {!ctx.isLogin && (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-accent text-center mt-3">
                  Sign in
                </Link>
              )}
            </nav>
            <form onSubmit={handleSearch} className="container pb-4">
              <div className="relative">
                <input
                  type="search"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search products..."
                  className="input pl-10 py-2.5 text-sm"
                />
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              </div>
            </form>
          </div>
        )}
      </header>
    </>
  );
}
