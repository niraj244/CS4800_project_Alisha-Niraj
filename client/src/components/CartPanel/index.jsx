import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseOutline, IoTrashOutline, IoAddOutline, IoRemoveOutline, IoArrowForward, IoCartOutline } from 'react-icons/io5';
import { MyContext } from '../../App';
import { deleteData, postData, fetchDataFromApi, editData } from '../../utils/api';

const FREE_SHIPPING_THRESHOLD = 2000;

function cloudinaryUrl(src, width = 120) {
  if (!src) return src;
  if (src.includes('res.cloudinary.com')) {
    return src.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }
  return src;
}

export default function CartPanel() {
  const ctx = useContext(MyContext);
  const [upsell, setUpsell] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const items = ctx.cartData || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    if (ctx.openCartPanel && items.length > 0) {
      fetchDataFromApi('/api/product?isFeatured=true&limit=4').then((res) => {
        const products = res?.productList || [];
        const cartIds = new Set(items.map((i) => i.productId));
        const candidate = products.find((p) => !cartIds.has(p._id));
        if (candidate) setUpsell(candidate);
      });
    }
  }, [ctx.openCartPanel]);

  const removeItem = async (id) => {
    await deleteData(`/api/cart/delete-cart-item/${id}`);
    ctx.getCartItems();
  };

  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) { removeItem(item._id); return; }
    if (newQty > item.countInStock) { ctx.alertBox('error', 'Not enough stock'); return; }
    setUpdatingId(item._id);
    await editData('/api/cart/update-qty', { _id: item._id, quantity: newQty });
    ctx.getCartItems();
    setUpdatingId(null);
  };

  const close = ctx.toggleCartPanel(false);

  return (
    <AnimatePresence>
      {ctx.openCartPanel && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={close}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <IoCartOutline size={20} />
                <h2 className="font-display font-bold text-base">
                  Your Cart {items.length > 0 && <span className="text-text-muted font-normal text-sm">({items.length})</span>}
                </h2>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-md hover:bg-surface-alt transition-colors"
                aria-label="Close cart"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            {items.length === 0 ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center">
                  <IoCartOutline size={28} className="text-text-muted" />
                </div>
                <p className="font-semibold">Your cart is empty</p>
                <p className="text-sm text-text-muted">Add something awesome to get started</p>
                <button onClick={close} className="btn-accent">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Free shipping progress */}
                <div className="px-5 py-3 bg-surface-alt border-b border-border">
                  {remaining === 0 ? (
                    <p className="text-xs text-success font-semibold text-center">
                      You've unlocked free shipping!
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted text-center mb-2">
                      Add <span className="font-bold text-text-primary">रु {remaining.toLocaleString()}</span> more for free shipping
                    </p>
                  )}
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto py-3 px-5 space-y-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3 py-3 border-b border-border last:border-0">
                      <Link
                        to={`/product/${item.productId}`}
                        onClick={close}
                        className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-surface-alt block"
                      >
                        <img
                          src={cloudinaryUrl(item.image)}
                          alt={item.productTitle}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          onClick={close}
                          className="text-sm font-semibold leading-snug line-clamp-2 hover:text-accent transition-colors block mb-0.5"
                        >
                          {item.productTitle}
                        </Link>
                        {item.size && (
                          <span className="text-xs text-text-muted">Size: {item.size}</span>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          {/* Qty stepper */}
                          <div className="flex items-center border border-border rounded-md overflow-hidden">
                            <button
                              onClick={() => updateQty(item, -1)}
                              disabled={updatingId === item._id}
                              className="w-7 h-7 flex items-center justify-center hover:bg-surface-alt transition-colors disabled:opacity-40"
                            >
                              <IoRemoveOutline size={13} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item, 1)}
                              disabled={updatingId === item._id}
                              className="w-7 h-7 flex items-center justify-center hover:bg-surface-alt transition-colors disabled:opacity-40"
                            >
                              <IoAddOutline size={13} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">
                              रु {(item.price * item.quantity).toLocaleString()}
                            </span>
                            <button
                              onClick={() => removeItem(item._id)}
                              className="p-1 text-text-muted hover:text-danger transition-colors"
                              aria-label="Remove item"
                            >
                              <IoTrashOutline size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Upsell */}
                  {upsell && (
                    <div className="border border-border rounded-xl p-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">You might also like</p>
                      <div className="flex gap-3 items-center">
                        <Link to={`/product/${upsell.slug || upsell._id}`} onClick={close} className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-surface-alt">
                          <img src={cloudinaryUrl(upsell.images?.[0], 80)} alt={upsell.name} className="w-full h-full object-cover" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold line-clamp-2 leading-snug">{upsell.name}</p>
                          <p className="text-xs font-bold mt-0.5">रु {upsell.price?.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => { ctx.addToCart(upsell, ctx.userData?._id, 1); }}
                          className="shrink-0 text-xs bg-primary text-white px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-border px-5 py-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Subtotal</span>
                    <span className="font-bold">रु {subtotal.toLocaleString()}</span>
                  </div>
                  {remaining === 0 && (
                    <div className="flex items-center justify-between text-success text-sm">
                      <span>Shipping</span>
                      <span className="font-semibold">Free</span>
                    </div>
                  )}
                  <p className="text-xs text-text-muted">Taxes and shipping calculated at checkout</p>

                  <Link
                    to="/checkout"
                    onClick={close}
                    className="btn-accent w-full flex items-center justify-center gap-2 text-sm py-3"
                  >
                    Checkout — रु {subtotal.toLocaleString()} <IoArrowForward size={15} />
                  </Link>

                  <Link
                    to="/cart"
                    onClick={close}
                    className="block text-center text-sm text-text-muted hover:text-accent transition-colors"
                  >
                    View full cart
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
