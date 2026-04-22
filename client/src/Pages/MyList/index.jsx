import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MyListItems from './myListItems';
import AccountSidebar from '../../components/AccountSidebar';
import { MyContext } from '../../App';
import SEO from '../../components/SEO';

export default function MyList() {
  const context = useContext(MyContext);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <SEO title="Wishlist — VibeFit" description="" url="/my-list" />
      <section className="py-8 pb-16">
        <div className="container flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block w-56 shrink-0">
            <AccountSidebar />
          </div>

          <div className="flex-1">
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h1 className="font-display font-bold text-xl">Wishlist</h1>
                <p className="text-text-muted text-sm mt-0.5">
                  {context?.myListData?.length || 0} saved items
                </p>
              </div>

              {context?.myListData?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <div className="text-5xl">🤍</div>
                  <h3 className="font-display font-bold text-lg">Your wishlist is empty</h3>
                  <p className="text-text-muted text-sm">Save items you love for later</p>
                  <Link to="/shop" className="btn-accent px-6 py-2.5">Browse Products</Link>
                </div>
              ) : (
                context.myListData.map((item, index) => (
                  <MyListItems key={index} item={item} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
