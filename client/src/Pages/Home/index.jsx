import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import ProductCard from '../../components/ProductCard';
import SEO from '../../components/SEO';
import { IoArrowForward, IoShieldCheckmarkOutline, IoRefreshOutline, IoCarOutline, IoStarSharp } from 'react-icons/io5';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// ── Collection tiles ────────────────────────────────────────────
const COLLECTIONS = [
  { label: 'New Drops',   href: '/collections/new-drops',   bg: 'bg-primary',       img: '/banner1.webp' },
  { label: 'Bestsellers', href: '/collections/bestsellers', bg: 'bg-gray-800',      img: '/banner2.webp' },
  { label: 'On Sale',     href: '/collections/sale',        bg: 'bg-accent',        img: '/banner3.webp' },
  { label: 'Summer Vibes',href: '/collections/summer-vibes',bg: 'bg-orange-900',   img: '/banner5.webp' },
];

// ── Trust badges ────────────────────────────────────────────────
const TRUST = [
  { Icon: IoCarOutline,           label: 'Nepal-wide delivery',  sub: 'Fast & reliable' },
  { Icon: IoRefreshOutline,       label: '30-day returns',        sub: 'No questions asked' },
  { Icon: IoShieldCheckmarkOutline,label: 'Secure checkout',      sub: 'eSewa & Khalti' },
  { Icon: IoStarSharp,            label: '4.8★ avg rating',       sub: '1,200+ reviews' },
];

// ── Email capture section ───────────────────────────────────────
function EmailCapture() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const res = await postData('/api/user/subscribe', { email: email.trim(), source: 'home_capture' });
    setLoading(false);
    if (res?.success) {
      setCode(res.couponCode);
      setEmail('');
    }
  };

  if (code) {
    return (
      <div className="bg-surface-alt border border-border rounded-xl p-8 text-center max-w-md mx-auto">
        <p className="text-2xl mb-2">🎉</p>
        <h3 className="font-display font-bold text-xl mb-1">Your discount code</h3>
        <p className="text-text-muted text-sm mb-4">Use this at checkout for 10% off your first order</p>
        <div className="bg-primary text-white font-mono font-bold text-xl py-3 px-6 rounded-lg tracking-widest">
          {code}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="input flex-1"
      />
      <button type="submit" disabled={loading} className="btn-accent flex items-center justify-center gap-2 shrink-0">
        {loading ? 'Joining...' : <>Claim 10% off <IoArrowForward size={14} /></>}
      </button>
    </form>
  );
}

// ── Star rating display ─────────────────────────────────────────
function Stars({ rating = 0 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <IoStarSharp
          key={s}
          size={13}
          className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}
        />
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────
export default function Home() {
  const ctx = useContext(MyContext);
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    fetchDataFromApi('/api/product?isFeatured=true&limit=8').then((res) => {
      if (res?.productList) setFeaturedProducts(res.productList);
    });
    fetchDataFromApi('/api/product?limit=8&sort=-createdAt').then((res) => {
      if (res?.productList) setNewProducts(res.productList);
    });
    fetchDataFromApi('/api/user/getAllReviews').then((res) => {
      if (res?.reviews) setReviews(res.reviews.slice(0, 6));
    });
  }, []);

  return (
    <>
      <SEO
        title="VibeFit — Your Confidence Matters"
        description="Modern streetwear & lifestyle clothing brand from Nepal. Shop new drops, bestsellers and exclusive collections."
        url="/"
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary text-white min-h-[70vh] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/banner1.webp"
            alt=""
            role="presentation"
            loading="eager"
            decoding="async"
            onLoad={() => setHeroLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-700 ${heroLoaded ? 'opacity-40' : 'opacity-0'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>

        <div className="container relative z-10 py-20">
          <div className="max-w-xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">New Collection 2025</p>
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              Wear Your<br />
              <span className="text-accent">Confidence</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-sm">
              Bold streetwear from Kathmandu. Made for the ones who don't follow — they lead.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/collections/new-drops" className="btn-accent text-base px-8 py-3.5 flex items-center gap-2">
                Shop New Drops <IoArrowForward size={16} />
              </Link>
              <Link to="/about" className="btn-outline border-white text-white hover:bg-white hover:text-primary px-8 py-3.5">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────── */}
      <section className="border-y border-border bg-white">
        <div className="container py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x divide-border">
            {TRUST.map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 justify-center md:justify-start">
                <Icon size={22} className="text-accent shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-text-muted">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS GRID ─────────────────────────────────── */}
      <section className="container py-16">
        <h2 className="font-display font-bold text-3xl mb-8">Shop Collections</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {COLLECTIONS.map(({ label, href, img }) => (
            <Link
              key={href}
              to={href}
              className="group relative rounded-xl overflow-hidden aspect-[3/4] block bg-gray-100"
            >
              <img
                src={img}
                alt={label}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="font-display font-bold text-lg leading-tight">{label}</p>
                <p className="text-xs text-gray-300 flex items-center gap-1 mt-0.5 group-hover:gap-2 transition-all">
                  Shop now <IoArrowForward size={11} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ─────────────────────────────────── */}
      {ctx.catData?.length > 0 && (
        <section className="container pb-16">
          <h2 className="font-display font-bold text-3xl mb-8">Shop by Category</h2>
          <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-3 md:grid md:grid-cols-6 min-w-max md:min-w-0">
              {ctx.catData.filter((c) => !c.parentId).slice(0, 6).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat._id}`}
                  className="group flex flex-col items-center gap-2 w-24 md:w-auto"
                >
                  <div className="w-20 h-20 md:w-full md:aspect-square rounded-full md:rounded-xl overflow-hidden bg-surface-alt border border-border group-hover:border-accent transition-colors">
                    {cat.images?.[0] ? (
                      <img src={cat.images[0]} alt={cat.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-alt text-2xl">👕</div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BESTSELLERS ──────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="bg-surface-alt py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display font-bold text-3xl">Bestsellers</h2>
              <Link to="/collections/bestsellers" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
                View all <IoArrowForward size={14} />
              </Link>
            </div>
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              autoplay={{ delay: 4000, disableOnInteraction: true }}
              spaceBetween={16}
              slidesPerView={2}
              breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
              className="productsSlider"
            >
              {featuredProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* ── NEW DROPS ────────────────────────────────────────── */}
      {newProducts.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-3xl">New Drops</h2>
            <Link to="/collections/new-drops" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
              View all <IoArrowForward size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── BRAND STORY STRIP ────────────────────────────────── */}
      <section className="bg-primary text-white py-16">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Our story</p>
            <h2 className="font-display font-bold text-4xl lg:text-5xl leading-tight mb-6">
              Born in Kathmandu.<br />Worn everywhere.
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-sm">
              VibeFit started with one idea: that your outfit should match your energy. We make clothes for the ones who move fast, think bold, and never settle.
            </p>
            <Link to="/about" className="btn-outline border-white text-white hover:bg-white hover:text-primary inline-flex items-center gap-2">
              Read our story <IoArrowForward size={14} />
            </Link>
          </div>
          <div className="relative aspect-square max-w-sm mx-auto md:mx-0">
            <img
              src="/banner4.jpg"
              alt="VibeFit brand story"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute -bottom-4 -left-4 bg-accent text-white rounded-xl px-5 py-4 text-center shadow-lg">
              <p className="font-display font-bold text-2xl">1K+</p>
              <p className="text-xs">Happy customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS / UGC ────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section className="container py-16">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl mb-2">What people are saying</h2>
            <p className="text-text-muted">Real reviews from real VibeFit customers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-surface-alt border border-border rounded-xl p-5 space-y-3">
                <Stars rating={r.rating} />
                <p className="text-sm text-text-primary line-clamp-3">"{r.review}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                    {r.userName?.[0]?.toUpperCase() || 'V'}
                  </div>
                  <p className="text-xs font-semibold">{r.userName || 'VibeFit Customer'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── EMAIL CAPTURE ─────────────────────────────────────── */}
      <section className="bg-surface-alt border-y border-border py-16">
        <div className="container text-center">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Members only</p>
          <h2 className="font-display font-bold text-3xl mb-3">Get 10% off your first order</h2>
          <p className="text-text-muted mb-8">Join 5,000+ VibeFit members. No spam, ever.</p>
          <EmailCapture />
        </div>
      </section>
    </>
  );
}
