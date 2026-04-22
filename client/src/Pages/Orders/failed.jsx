import { Link } from 'react-router-dom';
import { IoCloseCircle, IoArrowForward } from 'react-icons/io5';
import SEO from '../../components/SEO';

export function OrderFailed() {
  return (
    <>
      <SEO title="Payment Failed — VibeFit" description="" url="/order/failed" />
      <div className="container py-20 text-center max-w-lg">
        <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <IoCloseCircle size={48} className="text-danger" />
        </div>
        <h1 className="font-display font-bold text-3xl mb-3">Payment Failed</h1>
        <p className="text-text-muted mb-8">
          Something went wrong with your payment. Your cart is still saved — please try again or choose a different payment method.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/checkout" className="btn-accent flex items-center justify-center gap-2">
            Try Again <IoArrowForward size={14} />
          </Link>
          <Link to="/cart" className="btn-outline">View Cart</Link>
        </div>
      </div>
    </>
  );
}
