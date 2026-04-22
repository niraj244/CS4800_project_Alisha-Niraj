import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoCheckmarkCircle, IoArrowForward } from 'react-icons/io5';
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import SEO from '../../components/SEO';

export function OrderSuccess() {
  const ctx = useContext(MyContext);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (ctx.userData?._id) {
      fetchDataFromApi('/api/order/order-list/orders?limit=1').then((res) => {
        if (res?.data?.[0]) setLastOrder(res.data[0]);
      });
    }
  }, [ctx.userData]);

  return (
    <>
      <SEO title="Order Confirmed — VibeFit" description="" url="/order/success" />
      <div className="container py-20 text-center max-w-lg">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <IoCheckmarkCircle size={48} className="text-success" />
        </div>
        <h1 className="font-display font-bold text-3xl mb-3">Order Confirmed!</h1>
        <p className="text-text-muted mb-2">
          Thank you for shopping with VibeFit. Your order has been placed and is being processed.
        </p>
        {lastOrder?._id && (
          <p className="text-sm font-mono bg-surface-alt border border-border rounded-lg px-4 py-2 inline-block mt-3 mb-6">
            Order #{lastOrder._id.slice(-8).toUpperCase()}
          </p>
        )}
        <p className="text-sm text-text-muted mb-8">
          A confirmation email has been sent to your registered email address.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/my-orders" className="btn-accent flex items-center justify-center gap-2">
            Track Order <IoArrowForward size={14} />
          </Link>
          <Link to="/shop" className="btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </>
  );
}
