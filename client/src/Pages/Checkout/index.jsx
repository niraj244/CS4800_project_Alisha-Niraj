import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoCheckmarkCircle, IoAddOutline, IoLockClosedOutline } from 'react-icons/io5';
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import SEO from '../../components/SEO';
import axios from 'axios';

const FREE_SHIPPING = 2000;
const VITE_API_URL = import.meta.env.VITE_API_URL;

function cloudinaryUrl(src, width = 80) {
  if (!src) return src;
  if (src.includes('res.cloudinary.com')) return src.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  return src;
}

const STEPS = ['Delivery', 'Payment', 'Review'];

export default function Checkout() {
  const ctx = useContext(MyContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponId, setCouponId] = useState('');
  const [couponError, setCouponError] = useState('');
  const [placing, setPlacing] = useState(false);

  const items = ctx.cartData || [];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : 150;
  const discountAmt = Math.round(subtotal * (discount / 100));
  const total = subtotal + shipping - discountAmt;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (ctx.userData?.address_details) {
      setAddresses(ctx.userData.address_details);
      if (ctx.userData.address_details.length > 0) setSelectedAddressId(ctx.userData.address_details[0]._id);
    }
  }, [ctx.userData]);

  const refreshAddresses = () => {
    fetchDataFromApi('/api/user/user-details').then((res) => {
      const addrs = res?.data?.address_details || [];
      setAddresses(addrs);
      if (addrs.length > 0 && !selectedAddressId) setSelectedAddressId(addrs[0]._id);
    });
  };

  const applyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    const res = await postData('/api/coupon/validate', { code: couponCode.trim() });
    if (res?.error === false) {
      setDiscount(res.discountPercent);
      setCouponId(res.couponId);
    } else {
      setCouponError(res?.message || 'Invalid coupon');
      setDiscount(0);
      setCouponId('');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { ctx.alertBox('error', 'Please select a delivery address'); return; }
    if (items.length === 0) { ctx.alertBox('error', 'Your cart is empty'); return; }
    setPlacing(true);

    const addressObj = addresses.find((a) => a._id === selectedAddressId);
    const payload = {
      userId: ctx.userData?._id,
      products: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price, size: i.size })),
      delivery_address: addressObj,
      totalAmount: total,
      couponId: couponId || undefined,
    };

    try {
      if (paymentMethod === 'esewa') {
        const res = await postData('/api/payments/esewa/initiate', payload);
        if (res?.formData) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = res.esewaUrl;
          Object.entries(res.formData).forEach(([k, v]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = k;
            input.value = v;
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        } else {
          ctx.alertBox('error', res?.message || 'eSewa initiation failed');
          setPlacing(false);
        }
      } else if (paymentMethod === 'khalti') {
        const res = await postData('/api/payments/khalti/initiate', payload);
        if (res?.payment_url) {
          window.location.href = res.payment_url;
        } else {
          ctx.alertBox('error', res?.message || 'Khalti initiation failed');
          setPlacing(false);
        }
      }
    } catch {
      ctx.alertBox('error', 'Something went wrong. Please try again.');
      setPlacing(false);
    }
  };

  if (!ctx.isLogin) {
    return (
      <div className="container py-20 text-center">
        <p className="text-xl font-display font-bold mb-4">Please sign in to checkout</p>
        <Link to="/login" className="btn-accent">Sign In</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="text-xl font-display font-bold mb-4">Your cart is empty</p>
        <Link to="/shop" className="btn-accent">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <>
      <SEO title="Checkout — VibeFit" description="" url="/checkout" />

      <div className="container py-10 max-w-5xl">
        <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${i <= step ? 'text-accent' : 'text-text-muted'} ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${i < step ? 'bg-accent border-accent text-white' : i === step ? 'border-accent text-accent' : 'border-border text-text-muted'}`}>
                  {i < step ? <IoCheckmarkCircle size={16} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`w-10 sm:w-16 h-0.5 mx-2 ${i < step ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10">

          {/* ── Left: steps ─────────────────────── */}
          <div>

            {/* STEP 0: Delivery */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl">Delivery address</h2>

                {addresses.length === 0 ? (
                  <div className="border border-border rounded-xl p-6 text-center">
                    <p className="text-text-muted text-sm mb-4">No saved addresses</p>
                    <Link to="/address" className="btn-accent inline-flex items-center gap-2 text-sm">
                      <IoAddOutline size={16} /> Add an address
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr._id}
                        className={`flex gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr._id}
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="mt-0.5 accent-accent"
                        />
                        <div className="text-sm">
                          <p className="font-semibold">{addr.fullName || addr.name}</p>
                          <p className="text-text-muted">{addr.streetAddressLine1}</p>
                          {addr.streetAddressLine2 && <p className="text-text-muted">{addr.streetAddressLine2}</p>}
                          <p className="text-text-muted">{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                          {addr.mobile && <p className="text-text-muted">{addr.mobile}</p>}
                        </div>
                      </label>
                    ))}
                    <Link to="/address" onClick={refreshAddresses} className="inline-flex items-center gap-2 text-sm text-accent hover:underline mt-1">
                      <IoAddOutline size={16} /> Add another address
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => { if (!selectedAddressId) { ctx.alertBox('error', 'Select an address'); return; } setStep(1); }}
                  className="btn-accent w-full py-3 mt-4"
                  disabled={!selectedAddressId}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl">Payment method</h2>

                <div className="space-y-3">
                  {[
                    { id: 'esewa', label: 'eSewa', sub: 'Pay with your eSewa wallet', logo: '/esewa-logo.png' },
                    { id: 'khalti', label: 'Khalti', sub: 'Pay with your Khalti wallet', logo: '/khalti-logo.png' },
                  ].map(({ id, label, sub, logo }) => (
                    <label
                      key={id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={id}
                        checked={paymentMethod === id}
                        onChange={() => setPaymentMethod(id)}
                        className="accent-accent"
                      />
                      <img src={logo} alt={label} className="h-7 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-text-muted">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Coupon */}
                <div className="pt-4 border-t border-border">
                  <label className="block text-sm font-semibold mb-2">Coupon code (optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); if (!e.target.value) { setDiscount(0); setCouponId(''); } }}
                      placeholder="VIBE10"
                      className="input flex-1 uppercase"
                    />
                    <button onClick={applyCoupon} className="btn-outline px-4 text-sm shrink-0">Apply</button>
                  </div>
                  {couponError && <p className="text-danger text-xs mt-1">{couponError}</p>}
                  {discount > 0 && <p className="text-success text-xs mt-1 font-semibold">{discount}% discount applied!</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(0)} className="btn-outline flex-1 py-3 text-sm">Back</button>
                  <button onClick={() => setStep(2)} className="btn-accent flex-1 py-3">Review Order</button>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl">Review your order</h2>

                {/* Delivery summary */}
                <div className="p-4 rounded-xl border border-border bg-surface-alt text-sm">
                  <p className="font-semibold mb-1">Delivering to:</p>
                  {(() => {
                    const a = addresses.find((x) => x._id === selectedAddressId);
                    if (!a) return null;
                    return <p className="text-text-muted">{[a.fullName || a.name, a.streetAddressLine1, a.city, a.pincode].filter(Boolean).join(', ')}</p>;
                  })()}
                </div>

                {/* Payment summary */}
                <div className="p-4 rounded-xl border border-border bg-surface-alt text-sm">
                  <p className="font-semibold mb-1">Payment:</p>
                  <p className="text-text-muted capitalize">{paymentMethod} Wallet{discount > 0 ? ` + ${discount}% coupon` : ''}</p>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-alt shrink-0">
                        <img src={cloudinaryUrl(item.image)} alt={item.productTitle} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-1">{item.productTitle}</p>
                        <p className="text-xs text-text-muted">Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}</p>
                      </div>
                      <p className="text-sm font-bold shrink-0">रु {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3 text-sm">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="btn-accent flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <IoLockClosedOutline size={16} />
                    {placing ? 'Redirecting...' : `Pay रु ${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order summary ─────────────── */}
          <div className="lg:sticky lg:top-24 space-y-4 h-fit">
            <div className="border border-border rounded-xl p-5">
              <h3 className="font-display font-bold text-base mb-4">Order Summary</h3>

              <div className="space-y-2 text-sm mb-4">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span className="text-text-muted line-clamp-1 flex-1 mr-2">{item.productTitle} ×{item.quantity}</span>
                    <span className="font-semibold shrink-0">रु {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span>रु {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Shipping</span>
                  <span className={shipping === 0 ? 'text-success font-semibold' : ''}>{shipping === 0 ? 'Free' : `रु ${shipping}`}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon ({discount}%)</span>
                    <span>−रु {discountAmt.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border mt-3 pt-3 flex justify-between font-display font-bold text-lg">
                <span>Total</span>
                <span>रु {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
              <IoLockClosedOutline size={12} />
              Secured by eSewa & Khalti
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
