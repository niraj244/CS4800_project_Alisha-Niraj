import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../App';
import { IoHeartOutline, IoHeart, IoBagAddOutline, IoStarSharp } from 'react-icons/io5';
import { fetchDataFromApi, postData, deleteData } from '../../utils/api';

function Stars({ rating = 0 }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((s) => (
        <IoStarSharp key={s} size={11} className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'} />
      ))}
    </div>
  );
}

function cloudinaryUrl(src, width = 400) {
  if (!src || src.includes('res.cloudinary.com')) {
    return src?.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`) || src;
  }
  return src;
}

export default function ProductCard({ product }) {
  const ctx = useContext(MyContext);
  const [hovered, setHovered] = useState(false);
  const [wishActive, setWishActive] = useState(
    () => ctx.myListData?.some((m) => m.productId === product?._id) ?? false
  );
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const isLowStock = product.countInStock > 0 && product.countInStock <= 5;
  const isOutOfStock = product.countInStock === 0;
  const hasDiscount = product.discount > 0;
  const isNew = !hasDiscount && (Date.now() - new Date(product.createdAt).getTime() < 14 * 24 * 3600 * 1000);

  const mainImg = cloudinaryUrl(product.images?.[0], 400);
  const hoverImg = product.images?.[1] ? cloudinaryUrl(product.images[1], 400) : mainImg;

  const slug = product.slug || product._id;
  const href = `/product/${slug}`;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!ctx.isLogin) { ctx.alertBox('error', 'Please sign in first'); return; }
    if (isOutOfStock || adding) return;
    setAdding(true);
    ctx.addToCart(product, ctx.userData?._id, 1);
    setTimeout(() => setAdding(false), 1000);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
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
        productTitle: product.name,
        image: product.images?.[0],
        rating: product.rating,
        price: product.price,
        oldPrice: product.oldPrice,
        discount: product.discount,
        productId: product._id,
        brand: product.brand,
        countInStock: product.countInStock,
      });
      setWishActive(true);
      ctx.getMyListData();
    }
  };

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link to={href} className="block relative aspect-square overflow-hidden bg-surface-alt">
        <img
          src={hovered ? hoverImg : mainImg}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <span className="badge-new">New</span>}
          {hasDiscount && <span className="badge-sale">-{product.discount}%</span>}
          {isLowStock && <span className="badge-low">Only {product.countInStock} left</span>}
          {isOutOfStock && <span className="badge-low">Sold out</span>}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={wishActive ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
        >
          {wishActive
            ? <IoHeart size={16} className="text-accent" />
            : <IoHeartOutline size={16} className="text-text-muted" />}
        </button>

        {/* Quick add — desktop hover */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-250"
          >
            <IoBagAddOutline size={14} />
            {adding ? 'Added!' : 'Quick Add'}
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link to={href} className="block">
          <p className="text-xs text-text-muted truncate mb-0.5">{product.brand}</p>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 hover:text-accent transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-2">
          <Stars rating={product.rating} />
          <span className="text-xs text-text-muted">({product.rating?.toFixed(1) || '0.0'})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">रु {product.price?.toLocaleString()}</span>
          {product.oldPrice > 0 && product.oldPrice > product.price && (
            <span className="text-xs text-text-muted line-through">रु {product.oldPrice?.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
