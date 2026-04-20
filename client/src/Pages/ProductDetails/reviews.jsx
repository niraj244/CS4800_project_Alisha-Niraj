import { useContext, useEffect, useState } from 'react';
import { IoStarSharp, IoTrashOutline, IoImageOutline, IoCloseOutline } from 'react-icons/io5';
import axios from 'axios';
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';

function Stars({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = onChange ? (hovered || value) : value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <IoStarSharp
            size={onChange ? 22 : 14}
            className={s <= Math.round(display) ? 'text-yellow-400' : 'text-gray-200'}
          />
        </button>
      ))}
    </div>
  );
}

export function Reviews({ productId, setReviewsCount, refreshProductData }) {
  const ctx = useContext(MyContext);
  const [reviewsData, setReviewsData] = useState([]);
  const [form, setForm] = useState({ review: '', rating: 5 });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getReviews = () => {
    fetchDataFromApi(`/api/user/getReviews?productId=${productId}`).then((res) => {
      if (res?.error === false) {
        setReviewsData(res.reviews);
        setReviewsCount?.(res.reviews.length);
      }
    });
  };

  useEffect(() => { if (productId) getReviews(); }, [productId]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files).filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)
    );
    setSelectedImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.review.trim()) { ctx.alertBox('error', 'Please write a review'); return; }
    if (!ctx.isLogin) { ctx.alertBox('error', 'Please sign in to leave a review'); return; }
    setLoading(true);

    let uploadedUrls = [];
    if (selectedImages.length > 0) {
      try {
        const fd = new FormData();
        selectedImages.forEach((img) => fd.append('reviewImages', img));
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/uploadReviewImages`, fd, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        uploadedUrls = res?.data?.images || [];
      } catch {
        ctx.alertBox('error', 'Failed to upload images');
      }
    }

    const payload = {
      review: form.review,
      rating: form.rating,
      reviewImages: uploadedUrls,
      image: ctx.userData?.avatar,
      userName: ctx.userData?.name,
      userId: ctx.userData?._id,
      productId,
    };

    const res = await postData('/api/user/addReview', payload);
    setLoading(false);
    if (res?.error === false) {
      ctx.alertBox('success', res.message);
      setForm({ review: '', rating: 5 });
      setSelectedImages([]);
      setImagePreviews([]);
      getReviews();
      refreshProductData?.();
    } else {
      ctx.alertBox('error', res?.message || 'Failed to submit review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    setDeletingId(reviewId);
    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/user/deleteReview/${reviewId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (res.data?.error === false) {
        ctx.alertBox('success', 'Review deleted');
        getReviews();
        refreshProductData?.();
      }
    } catch {
      ctx.alertBox('error', 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Existing reviews */}
      {reviewsData.length > 0 && (
        <div className="space-y-4">
          {reviewsData.map((r) => (
            <div key={r._id} className="bg-surface-alt border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold shrink-0">
                    {r.image ? (
                      <img src={r.image} alt={r.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{r.userName?.[0]?.toUpperCase() || 'V'}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{r.userName || 'VibeFit Customer'}</p>
                    <p className="text-xs text-text-muted">{r.createdAt?.split('T')[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Stars value={r.rating || 0} />
                  {ctx.userData?._id === r.userId && (
                    <button
                      onClick={() => handleDelete(r._id)}
                      disabled={deletingId === r._id}
                      className="p-1 text-text-muted hover:text-danger transition-colors disabled:opacity-40"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-text-muted mt-3 leading-relaxed">{r.review}</p>
              {r.reviewImages?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {r.reviewImages.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Review photo ${i + 1}`}
                      className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write a review */}
      <div className="bg-surface-alt border border-border rounded-xl p-6">
        <h3 className="font-display font-bold text-lg mb-5">Write a review</h3>
        {!ctx.isLogin ? (
          <p className="text-sm text-text-muted">
            Please <a href="/login" className="text-accent hover:underline">sign in</a> to leave a review.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Your rating</label>
              <Stars value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Your review</label>
              <textarea
                rows={4}
                required
                value={form.review}
                onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
                placeholder="Share your experience with this product..."
                className="input w-full resize-none"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-text-muted hover:text-accent transition-colors">
                <IoImageOutline size={16} />
                <span>Add photos (optional)</span>
                <input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
              </label>
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center">
                        <IoCloseOutline size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-accent flex items-center gap-2 disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
