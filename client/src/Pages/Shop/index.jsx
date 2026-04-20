import { useContext, useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import ProductCard from '../../components/ProductCard';
import SEO from '../../components/SEO';
import { IoFilterOutline, IoCloseOutline, IoChevronDownOutline } from 'react-icons/io5';

const SORT_OPTIONS = [
  { label: 'Newest',        value: '-createdAt' },
  { label: 'Price: Low–High', value: 'price' },
  { label: 'Price: High–Low', value: '-price' },
  { label: 'Top Rated',    value: '-rating' },
  { label: 'Best Sellers', value: '-numReviews' },
];

const PAGE_SIZE = 12;

export default function Shop() {
  const ctx = useContext(MyContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || '-createdAt';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({
      limit: PAGE_SIZE,
      page: pageParam,
      sort: sortParam,
      ...(categoryParam && { category: categoryParam }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
    });
    fetchDataFromApi(`/api/product?${qs}`).then((res) => {
      setProducts(res?.productList || []);
      setTotalPages(res?.totalPages || 1);
      setTotalCount(res?.totalProducts || 0);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [categoryParam, sortParam, pageParam, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const applyPrice = () => {
    const next = new URLSearchParams(searchParams);
    if (localMin) next.set('minPrice', localMin); else next.delete('minPrice');
    if (localMax) next.set('maxPrice', localMax); else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setLocalMin(''); setLocalMax('');
    setSearchParams({ sort: sortParam });
  };

  const activeCategory = ctx.catData?.find((c) => c._id === categoryParam);
  const hasFilters = categoryParam || minPrice || maxPrice;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Category</h3>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => setParam('category', '')}
              className={`text-sm w-full text-left px-2 py-1.5 rounded-md transition-colors ${!categoryParam ? 'bg-accent/10 text-accent font-semibold' : 'hover:bg-surface-alt'}`}
            >
              All Products
            </button>
          </li>
          {ctx.catData?.filter((c) => !c.parentId).map((cat) => (
            <li key={cat._id}>
              <button
                onClick={() => setParam('category', cat._id)}
                className={`text-sm w-full text-left px-2 py-1.5 rounded-md transition-colors ${categoryParam === cat._id ? 'bg-accent/10 text-accent font-semibold' : 'hover:bg-surface-alt'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Price (रु)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder="Min"
            className="input text-sm py-2 w-full"
          />
          <span className="text-text-muted">–</span>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder="Max"
            className="input text-sm py-2 w-full"
          />
        </div>
        <button onClick={applyPrice} className="btn-primary w-full mt-3 text-sm py-2">Apply</button>
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title={activeCategory ? `${activeCategory.name} — VibeFit` : 'Shop All — VibeFit'}
        description="Browse the full VibeFit collection. Filter by category, price, and more."
        url="/shop"
      />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container py-3 flex items-center gap-2 text-sm text-text-muted">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          {activeCategory ? (
            <>
              <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
              <span>/</span>
              <span className="text-text-primary font-medium">{activeCategory.name}</span>
            </>
          ) : (
            <span className="text-text-primary font-medium">Shop All</span>
          )}
        </div>
      </div>

      <div className="container py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl">{activeCategory?.name || 'All Products'}</h1>
            {!loading && <p className="text-sm text-text-muted mt-0.5">{totalCount} products</p>}
          </div>

          <div className="flex items-center gap-3">
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-danger hover:underline flex items-center gap-1">
                <IoCloseOutline size={14} /> Clear filters
              </button>
            )}

            {/* Sort */}
            <div className="relative">
              <select
                value={sortParam}
                onChange={(e) => setParam('sort', e.target.value)}
                className="appearance-none input text-sm py-2 pl-3 pr-8 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <IoChevronDownOutline className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" size={14} />
            </div>

            {/* Mobile filter btn */}
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden btn-outline flex items-center gap-2 text-sm py-2"
            >
              <IoFilterOutline size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <FilterContent />
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-surface-alt animate-pulse aspect-[3/4]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl font-display font-bold mb-2">No products found</p>
                <p className="text-text-muted text-sm mb-6">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-accent">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10 flex-wrap">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.set('page', p);
                        setSearchParams(next);
                      }}
                      className={`w-9 h-9 rounded-md text-sm font-semibold transition-colors ${p === pageParam ? 'bg-accent text-white' : 'bg-surface-alt hover:bg-border'}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="relative ml-auto w-72 h-full bg-white overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold">Filters</h3>
              <button onClick={() => setFilterOpen(false)} className="p-1 hover:bg-surface-alt rounded-md">
                <IoCloseOutline size={20} />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </>
  );
}
