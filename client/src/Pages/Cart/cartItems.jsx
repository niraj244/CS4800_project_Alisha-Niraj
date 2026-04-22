import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoCloseSharp } from 'react-icons/io5';
import { IoStarSharp } from 'react-icons/io5';
import { deleteData, editData, fetchDataFromApi } from '../../utils/api';
import { MyContext } from '../../App';

export default function CartItems({ item, qty, selected }) {
  const context = useContext(MyContext);
  const [selectedSize, setSelectedSize] = useState(selected || '');
  const [selectedQty, setSelectedQty] = useState(qty || 1);

  const handleQtyChange = (e) => {
    const value = parseInt(e.target.value);
    setSelectedQty(value);
    editData('/api/cart/update-qty', {
      _id: item?._id,
      qty: value,
      subTotal: item?.price * value,
    }).then((res) => {
      if (res?.data?.error === false) {
        context.alertBox('success', res?.data?.message);
        context?.getCartItems();
      }
    });
  };

  const handleSizeChange = (e) => {
    const val = e.target.value;
    fetchDataFromApi(`/api/product/${item?.productId}`).then((res) => {
      const product = res?.product;
      const available = product?.size?.some((s) => s.includes(val));
      if (available) {
        setSelectedSize(val);
        editData('/api/cart/update-qty', {
          _id: item?._id,
          qty: selectedQty,
          subTotal: item?.price * selectedQty,
          size: val,
        }).then((res) => {
          if (res?.data?.error === false) {
            context.alertBox('success', res?.data?.message);
            context?.getCartItems();
          }
        });
      } else {
        context.alertBox('error', `Size ${val} not available`);
      }
    });
  };

  const removeItem = () => {
    deleteData(`/api/cart/delete-cart-item/${item?._id}`).then(() => {
      context.alertBox('success', 'Removed from cart');
      context?.getCartItems();
    });
  };

  const stars = Math.round(item?.rating || 0);

  return (
    <div className="flex gap-4 p-4 border-b border-border last:border-0">
      <Link to={`/product/${item?.productId}`} className="shrink-0 w-20 h-24 rounded-lg overflow-hidden bg-surface-alt">
        <img src={item?.image} alt={item?.productTitle} className="w-full h-full object-cover hover:scale-105 transition-transform" />
      </Link>

      <div className="flex-1 min-w-0 relative pr-6">
        <button onClick={removeItem} className="absolute top-0 right-0 text-text-muted hover:text-danger transition-colors">
          <IoCloseSharp size={18} />
        </button>

        {item?.brand && <p className="text-xs text-text-muted uppercase tracking-wide">{item.brand}</p>}
        <Link to={`/product/${item?.productId}`} className="text-sm font-semibold hover:text-accent transition-colors line-clamp-2 leading-snug">
          {item?.productTitle}
        </Link>

        {stars > 0 && (
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <IoStarSharp key={i} size={11} className={i < stars ? 'text-yellow-400' : 'text-border'} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {item?.size && (
            <select
              value={selectedSize}
              onChange={handleSizeChange}
              className="text-xs border border-border rounded px-2 py-1 bg-white focus:outline-none focus:border-accent"
            >
              <option value={selectedSize}>Size: {selectedSize}</option>
            </select>
          )}
          <select
            value={selectedQty}
            onChange={handleQtyChange}
            className="text-xs border border-border rounded px-2 py-1 bg-white focus:outline-none focus:border-accent"
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {item?.discount > 0 ? (
            <>
              <span className="text-xs text-text-muted line-through">रु {parseInt(item.oldPrice).toLocaleString()}</span>
              <span className="text-sm font-bold text-accent">रु {parseInt(item.price).toLocaleString()}</span>
              <span className="text-xs bg-accent/10 text-accent font-semibold px-1.5 py-0.5 rounded">{item.discount}% OFF</span>
            </>
          ) : (
            <span className="text-sm font-bold">रु {parseInt(item.price).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
