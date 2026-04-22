import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsFillBagCheckFill } from 'react-icons/bs';
import CartItems from './cartItems';
import { MyContext } from '../../App';
import SEO from '../../components/SEO';

const FREE_SHIPPING_THRESHOLD = 2000;

export default function CartPage() {
  const context = useContext(MyContext);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const subtotal = context.cartData?.length
    ? context.cartData.reduce((sum, item) => sum + parseInt(item.price) * item.quantity, 0)
    : 0;

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <>
      <SEO title="Cart — VibeFit" description="" url="/cart" />
      <section className="py-8 pb-16">
        <div className="container">
          {context?.cartData?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
              <div className="w-24 h-24 rounded-full bg-surface-alt flex items-center justify-center text-4xl">🛒</div>
              <h2 className="font-display font-bold text-2xl">Your cart is empty</h2>
              <p className="text-text-muted">Add some items to get started</p>
              <Link to="/shop" className="btn-accent px-8 py-3">Continue Shopping</Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="bg-white border border-border rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h1 className="font-display font-bold text-xl">Your Cart</h1>
                    <p className="text-text-muted text-sm mt-0.5">
                      {context.cartData.length} {context.cartData.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  {context.cartData.map((item, index) => (
                    <CartItems key={index} item={item} qty={item.quantity} selected={item.size} />
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-80 shrink-0">
                <div className="bg-white border border-border rounded-2xl p-6 sticky top-24">
                  <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>

                  {!freeShipping && (
                    <div className="mb-4 p-3 bg-surface-alt rounded-lg text-sm">
                      <p className="text-text-muted mb-1.5">
                        Add <span className="font-semibold text-text-primary">रु {remaining.toLocaleString()}</span> more for free shipping
                      </p>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Subtotal</span>
                      <span className="font-semibold">रु {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Shipping</span>
                      <span className={freeShipping ? 'text-green-600 font-semibold' : 'font-semibold'}>
                        {freeShipping ? 'Free' : `रु ${(subtotal < FREE_SHIPPING_THRESHOLD ? 150 : 0).toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 mb-5">
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>रु {(subtotal + (freeShipping ? 0 : 150)).toLocaleString()}</span>
                    </div>
                  </div>

                  <Link to="/checkout" className="btn-accent w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold">
                    <BsFillBagCheckFill size={16} /> Proceed to Checkout
                  </Link>

                  <Link to="/shop" className="block text-center text-sm text-accent hover:underline mt-3">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
