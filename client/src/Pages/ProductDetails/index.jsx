import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IoStarSharp, IoHeartOutline, IoHeart, IoBagAddOutline, IoShieldCheckmarkOutline, IoRefreshOutline, IoCarOutline, IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData, postData } from '../../utils/api';
import { Reviews } from './reviews';
import ProductCard from '../../components/ProductCard';
import SEO from '../../components/SEO';

function Stars({ rating = 0, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <IoStarSharp key={s} size={size} className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'} />
      ))}
    </div>
  );
}

function cloudinaryUrl(src, width = 600) {
  if (!src) return src;
  if (src.includes('res.cloudinary.com')) return src.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  return src;
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function ProductDetails() {
  const { id } = useParams();
  const ctx = useContext(MyContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [wishActive, setWishActive] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [activeTab, setActiveTab] = useState('reviews');
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const reviewsRef = useRef();

  const fetchProduct = () => {
    setLoading(true);
    fetchDataFromApi(`/api/product/${id}`).then((res) => {
      if (res?.error === false) {
        const p = res.product;
        setProduct(p);
        setActiveImg(0);
        setSelectedSize(p.size?.[0] || '');
        setWishActive(ctx.myListData?.some((m) => m.productId === p._id) ?? false);

        if (p.subCatId) {
          fetchDataFromApi(`/api/product/getAllProductsBySubCatId/${p.subCatId}`).then((r) => {
            if (r?.error === false) setRelated(r.products.filter((x) => x._id !== id).slice(0, 8));
          });
        }
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!ctx.isLogin) { ctx.alertBox('error', 'Please sign in first'); return; }
    if (!selectedSize && product?.size?.length > 0) { ctx.alertBox('error', 'Please select a size'); return; }
    ctx.addToCart({ ...product, size: selectedSize }, ctx.userData?._id, qty);
  };

  const handleWishlist = async () => {
    if (!ctx.isLogin) { ctx.alertBox('error', 'Please sign in first'); return; }
    if (wishActive) {
      const item = ctx.myListData?.find((m) => m.productId === product._id);
      if (item) {
        await deleteData(`/api/myList/${item._id}`);
        setWishActive(false);
        ctx.getMyListData();
      }
    } else {
      await postData('/api/myList/add', {
        productTitle: product.name, image: product.images?.[0],
        rating: product.rating, price: product.price, oldPrice: product.oldPrice,
        discount: product.discount, productId: product._id, brand: product.brand, countInStock: product.countInStock,
      });
      setWishActive(true);
      ctx.getMyListData();
    }
  };

  const scrollToReviews = () => {
    setActiveTab('reviews');
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const images = product?.images?.length > 0 ? product.images : ['/banner1.webp'];
  const hasDiscount = product?.discount > 0;
  const isOutOfStock = product?.countInStock === 0;
  const sizes = product?.size?.length > 0
    ? [...product.size].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
    : [];

  if (loading) {
    return (
      <div className="container py-16">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square rounded-2xl bg-surface-alt" />
          <div className="space-y-4">
            <div className="h-8 bg-surface-alt rounded w-3/4" />
            <div className="h-4 bg-surface-alt rounded w-1/2" />
            <div className="h-10 bg-surface-alt rounded w-1/3" />
            <div className="h-32 bg-surface-alt rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-xl font-display font-bold mb-4">Product not found</p>
        <Link to="/shop" className="btn-accent">Back to Shop</Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${product.name} — VibeFit`}
        description={product.description?.slice(0, 160) || ''}
        image={product.images?.[0]}
        url={`/product/${id}`}
        type="product"
      />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container py-3 flex items-center gap-2 text-sm text-text-muted flex-wrap">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-text-primary font-medium line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Image gallery ─────────────────────── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-alt group">
              <img
                src={cloudinaryUrl(images[activeImg], 800)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <span className="absolute top-3 left-3 badge-sale">-{product.discount}%</span>
              )}
              {isOutOfStock && (
                <span className="absolute top-3 left-3 badge-low">Sold out</span>
              )}

              {/* Prev/next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IoChevronBackOutline size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IoChevronForwardOutline size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-accent' : 'border-transparent'}`}
                  >
                    <img src={cloudinaryUrl(img, 120)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ──────────────────────── */}
          <div className="space-y-5">
            <div>
              {product.brand && <p className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-1">{product.brand}</p>}
              <h1 className="font-display font-bold text-2xl lg:text-3xl leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            <button onClick={scrollToReviews} className="flex items-center gap-2 group">
              <Stars rating={product.rating} size={16} />
              <span className="text-sm text-text-muted group-hover:text-accent transition-colors">
                {product.rating?.toFixed(1) || '0.0'} ({reviewsCount} reviews)
              </span>
            </button>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="font-display font-bold text-3xl">रु {product.price?.toLocaleString()}</span>
              {product.oldPrice > product.price && (
                <span className="text-text-muted line-through text-lg">रु {product.oldPrice?.toLocaleString()}</span>
              )}
              {hasDiscount && (
                <span className="badge-sale text-sm">{product.discount}% off</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-text-muted leading-relaxed">{product.description}</p>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">Size: <span className="text-accent">{selectedSize}</span></label>
                  <button onClick={() => setSizeModalOpen(true)} className="text-xs text-accent hover:underline">
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-md border text-sm font-semibold transition-colors ${selectedSize === s ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add to cart */}
            <div className="flex gap-3">
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-surface-alt transition-colors text-lg">−</button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.countInStock, q + 1))} disabled={isOutOfStock} className="w-10 h-11 flex items-center justify-center hover:bg-surface-alt transition-colors text-lg disabled:opacity-40">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 btn-accent flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoBagAddOutline size={18} />
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </button>

              <button
                onClick={handleWishlist}
                aria-label={wishActive ? 'Remove from wishlist' : 'Add to wishlist'}
                className="w-11 h-11 flex items-center justify-center border border-border rounded-md hover:border-accent transition-colors"
              >
                {wishActive ? <IoHeart size={20} className="text-accent" /> : <IoHeartOutline size={20} />}
              </button>
            </div>

            {product.countInStock > 0 && product.countInStock <= 5 && (
              <p className="text-sm text-warning font-semibold">Only {product.countInStock} left in stock!</p>
            )}

            {/* Trust bullets */}
            <div className="border-t border-border pt-5 space-y-2.5">
              {[
                { Icon: IoCarOutline, text: 'Nepal-wide delivery' },
                { Icon: IoRefreshOutline, text: '30-day free returns' },
                { Icon: IoShieldCheckmarkOutline, text: 'Secure checkout via eSewa & Khalti' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-text-muted">
                  <Icon size={16} className="text-accent shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Reviews / Details ──────────────── */}
        <div className="mt-16" ref={reviewsRef}>
          <div className="flex gap-0 border-b border-border mb-8">
            {[
              { key: 'reviews', label: `Reviews (${reviewsCount})` },
              { key: 'details', label: 'Product Details' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${activeTab === key ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'reviews' ? (
            <Reviews
              productId={id}
              setReviewsCount={setReviewsCount}
              refreshProductData={fetchProduct}
            />
          ) : (
            <div className="max-w-2xl space-y-4 text-sm text-text-muted leading-relaxed">
              {product.description && <p>{product.description}</p>}
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 pt-4 border-t border-border">
                {product.brand && (<><dt className="font-semibold text-text-primary">Brand</dt><dd>{product.brand}</dd></>)}
                {product.category?.name && (<><dt className="font-semibold text-text-primary">Category</dt><dd>{product.category.name}</dd></>)}
                {product.weight && (<><dt className="font-semibold text-text-primary">Weight</dt><dd>{product.weight}g</dd></>)}
              </dl>
            </div>
          )}
        </div>

        {/* ── Related products ─────────────────────── */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display font-bold text-2xl mb-6">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Size guide modal */}
      {sizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSizeModalOpen(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl">Size Guide</h2>
              <button onClick={() => setSizeModalOpen(false)} className="p-1.5 hover:bg-surface-alt rounded-md">✕</button>
            </div>
            <p className="text-sm text-text-muted mb-4">All measurements in cm. When between sizes, size up.</p>
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-surface-alt">
                <tr>{['Size', 'Chest', 'Waist', 'Hip'].map((h) => (<th key={h} className="py-2 px-3 text-left font-semibold text-xs">{h}</th>))}</tr>
              </thead>
              <tbody>
                {[['XS','84–88','68–72','90–94'],['S','88–92','72–76','94–98'],['M','92–96','76–80','98–102'],['L','96–100','80–84','102–106'],['XL','100–104','84–88','106–110'],['XXL','104–108','88–92','110–114']].map(([s, c, w, h], i) => (
                  <tr key={s} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-alt'}>
                    <td className="py-2 px-3 font-bold">{s}</td>
                    <td className="py-2 px-3 text-text-muted">{c}</td>
                    <td className="py-2 px-3 text-text-muted">{w}</td>
                    <td className="py-2 px-3 text-text-muted">{h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
