import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { IoCloseSharp, IoStarSharp } from 'react-icons/io5';
import { MyContext } from '../../App';
import { deleteData } from '../../utils/api';

export default function MyListItems({ item }) {
  const context = useContext(MyContext);

  const removeItem = (id) => {
    deleteData(`/api/myList/${id}`).then(() => {
      context?.alertBox('success', 'Removed from wishlist');
      context?.getMyListData();
    });
  };

  const stars = Math.round(item?.rating || 0);

  return (
    <div className="flex gap-4 p-4 border-b border-border last:border-0">
      <Link to={`/product/${item?.productId}`} className="shrink-0 w-20 h-24 rounded-lg overflow-hidden bg-surface-alt">
        <img src={item?.image} alt={item?.productTitle} className="w-full h-full object-cover hover:scale-105 transition-transform" />
      </Link>

      <div className="flex-1 min-w-0 relative pr-6">
        <button onClick={() => removeItem(item?._id)}
          className="absolute top-0 right-0 text-text-muted hover:text-danger transition-colors">
          <IoCloseSharp size={18} />
        </button>

        {item?.brand && <p className="text-xs text-text-muted uppercase tracking-wide">{item.brand}</p>}
        <Link to={`/product/${item?.productId}`}
          className="text-sm font-semibold hover:text-accent transition-colors line-clamp-2 leading-snug">
          {item?.productTitle?.substr(0, 80)}...
        </Link>

        {stars > 0 && (
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <IoStarSharp key={i} size={11} className={i < stars ? 'text-yellow-400' : 'text-border'} />
            ))}
          </div>
        )}

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
