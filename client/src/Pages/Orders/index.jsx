import { useEffect, useState } from 'react';
import AccountSidebar from '../../components/AccountSidebar';
import { fetchDataFromApi } from '../../utils/api';
import SEO from '../../components/SEO';

const FILTERS = [
  { key: 'all', label: 'All Orders' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'returns', label: 'Returns' },
];

const STATUS_STYLES = {
  delivered: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  confirm: 'bg-purple-100 text-purple-700',
  processing: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' });
}

function StatusBadge({ status }) {
  const key = status?.toLowerCase();
  const label = { delivered: 'Delivered', shipped: 'Shipped', confirm: 'Confirmed', processing: 'Processing', pending: 'Processing' }[key] || status;
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[key] || 'bg-border text-text-muted'}`}>{label}</span>;
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const total = order?.products?.reduce((s, p) => s + (p.quantity || 0), 0);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex gap-2 flex-wrap">
          {order?.products?.slice(0, 4).map((p, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-alt shrink-0">
              {p?.image ? (
                <>
                  <img src={p.image} alt={p.productTitle} className="w-full h-full object-cover" />
                  {p.quantity > 1 && (
                    <span className="absolute top-0.5 right-0.5 bg-black/70 text-white text-[9px] px-1 rounded">x{p.quantity}</span>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">?</div>
              )}
            </div>
          ))}
          {order?.products?.length > 4 && (
            <div className="w-16 h-16 rounded-lg bg-surface-alt flex items-center justify-center text-sm text-text-muted font-semibold">
              +{order.products.length - 4}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={order?.order_status} />
            <span className="text-xs text-text-muted">{formatDate(order?.createdAt)}</span>
          </div>
          <p className="text-sm text-text-muted truncate">Order #{order?._id?.slice(-8).toUpperCase()}</p>
          <p className="text-sm font-bold mt-1">रु {(order?.totalAmt || 0).toLocaleString()}</p>
          <p className="text-xs text-text-muted">{total} item{total !== 1 ? 's' : ''}</p>
        </div>

        <button onClick={() => setExpanded((v) => !v)}
          className="text-sm text-accent hover:underline shrink-0">
          {expanded ? 'Hide details' : 'View details'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 bg-surface-alt space-y-3">
          {order?.products?.map((p, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <img src={p.image} alt={p.productTitle} className="w-10 h-10 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.productTitle}</p>
                <p className="text-text-muted text-xs">Qty: {p.quantity} · रु {parseInt(p.price).toLocaleString()}</p>
              </div>
              <p className="font-semibold shrink-0">रु {(parseInt(p.price) * p.quantity).toLocaleString()}</p>
            </div>
          ))}
          {order?.delivery_address && (
            <div className="pt-2 border-t border-border text-xs text-text-muted">
              <p className="font-semibold text-text-primary mb-0.5">Delivery Address</p>
              <p>{[order.delivery_address.address_line1, order.delivery_address.city, order.delivery_address.state, order.delivery_address.country].filter(Boolean).join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [activeFilter]);

  useEffect(() => {
    const statusParam = activeFilter === 'all' ? '' : `&status=${activeFilter}`;
    fetchDataFromApi(`/api/order/order-list/orders?page=${page}&limit=5${statusParam}`).then((res) => {
      if (res?.error === false) setOrders(res);
    });
  }, [page, activeFilter]);

  return (
    <>
      <SEO title="My Orders — VibeFit" description="" url="/orders" />
      <section className="py-8 pb-16">
        <div className="container flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block w-56 shrink-0">
            <AccountSidebar />
          </div>

          <div className="flex-1">
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h1 className="font-display font-bold text-xl mb-3">Your Orders</h1>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map(({ key, label }) => (
                    <button key={key} onClick={() => setActiveFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === key ? 'bg-primary text-white' : 'bg-surface-alt text-text-muted hover:bg-border'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-3">
                {!orders?.data?.length ? (
                  <div className="py-16 text-center text-text-muted">
                    <p className="text-2xl mb-2">📦</p>
                    <p>No orders found.</p>
                  </div>
                ) : (
                  orders.data.map((order, i) => <OrderCard key={order?._id || i} order={order} />)
                )}
              </div>

              {orders?.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-40 hover:bg-surface-alt">
                    ← Prev
                  </button>
                  <span className="text-sm text-text-muted">Page {page} of {orders.totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(orders.totalPages, p + 1))} disabled={page === orders.totalPages}
                    className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-40 hover:bg-surface-alt">
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
