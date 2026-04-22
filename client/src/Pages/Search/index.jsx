import { useContext, useEffect, useState } from 'react';
import { IoGridSharp } from 'react-icons/io5';
import { LuMenu } from 'react-icons/lu';
import ProductCard from '../../components/ProductCard';
import { postData } from '../../utils/api';
import { MyContext } from '../../App';
import SEO from '../../components/SEO';

const SORT_OPTIONS = [
  { label: 'Name, A to Z', name: 'name', order: 'asc' },
  { label: 'Name, Z to A', name: 'name', order: 'desc' },
  { label: 'Price: Low to High', name: 'price', order: 'asc' },
  { label: 'Price: High to Low', name: 'price', order: 'desc' },
];

export default function SearchPage() {
  const context = useContext(MyContext);
  const [itemView, setItemView] = useState('grid');
  const [productsData, setProductsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortLabel, setSortLabel] = useState('Sort By');
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSort = (opt) => {
    setSortLabel(opt.label);
    setSortOpen(false);
    postData('/api/product/sortBy', { products: productsData, sortBy: opt.name, order: opt.order }).then((res) => {
      setProductsData(res);
    });
  };

  const products = productsData?.products || [];

  return (
    <>
      <SEO title="Search — VibeFit" description="" url="/search" />
      <section className="py-6 pb-16">
        <div className="container flex gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between bg-surface-alt border border-border rounded-xl px-4 py-2.5 mb-5 sticky top-20 z-30">
              <div className="flex items-center gap-2">
                <button onClick={() => setItemView('list')}
                  className={`p-2 rounded-lg transition-colors ${itemView === 'list' ? 'bg-white shadow-sm' : 'hover:bg-border'}`}>
                  <LuMenu size={18} />
                </button>
                <button onClick={() => setItemView('grid')}
                  className={`p-2 rounded-lg transition-colors ${itemView === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-border'}`}>
                  <IoGridSharp size={16} />
                </button>
                <span className="text-sm text-text-muted ml-2 hidden sm:block">
                  {products.length} result{products.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="relative">
                <button onClick={() => setSortOpen((v) => !v)}
                  className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white hover:bg-surface-alt flex items-center gap-2">
                  {sortLabel}
                  <span className="text-text-muted text-xs">▾</span>
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-10 z-20 bg-white border border-border rounded-xl shadow-md py-1 w-48">
                      {SORT_OPTIONS.map((opt) => (
                        <button key={opt.label} onClick={() => handleSort(opt)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-surface-alt">
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className={`grid gap-4 ${itemView === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-surface-alt rounded-xl aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-display font-bold text-xl mb-1">No results found</p>
                <p className="text-text-muted text-sm">Try different keywords or browse our shop</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${itemView === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {products.map((item, i) => (
                  <ProductCard key={i} item={item} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-40">← Prev</button>
                <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-40">Next →</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
