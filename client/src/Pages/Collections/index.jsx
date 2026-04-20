import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api';
import ProductCard from '../../components/ProductCard';
import SEO from '../../components/SEO';

const COLLECTION_META = {
  'new-drops': {
    title: 'New Drops',
    description: 'The latest VibeFit pieces, fresh off the line.',
    query: '?sort=-createdAt&limit=24',
    filter: (p) => Date.now() - new Date(p.createdAt).getTime() < 30 * 24 * 3600 * 1000,
  },
  bestsellers: {
    title: 'Bestsellers',
    description: 'Our most-loved styles — proven crowd-pleasers.',
    query: '?isFeatured=true&limit=24',
    filter: () => true,
  },
  sale: {
    title: 'Sale',
    description: 'Discounted VibeFit pieces. Limited stock.',
    query: '?sort=-discount&limit=24',
    filter: (p) => p.discount > 0,
  },
  'summer-vibes': {
    title: 'Summer Vibes',
    description: 'Light, bold, and ready for the heat.',
    query: '?sort=-createdAt&limit=24',
    filter: () => true,
  },
};

export default function Collections() {
  const { slug } = useParams();
  const meta = COLLECTION_META[slug] || { title: slug, description: '', query: '?limit=24', filter: () => true };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDataFromApi(`/api/product${meta.query}`).then((res) => {
      const list = res?.productList || [];
      setProducts(list.filter(meta.filter));
      setLoading(false);
    });
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <>
      <SEO
        title={`${meta.title} — VibeFit`}
        description={meta.description}
        url={`/collections/${slug}`}
      />

      {/* Hero banner */}
      <div className="bg-primary text-white py-16 text-center">
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-3">{meta.title}</h1>
        <p className="text-gray-400 text-base max-w-md mx-auto">{meta.description}</p>
      </div>

      <div className="container py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-text-primary font-medium">{meta.title}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-surface-alt animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-display font-bold mb-2">No products yet</p>
            <p className="text-text-muted text-sm mb-6">Check back soon</p>
            <Link to="/shop" className="btn-accent">Browse all products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
