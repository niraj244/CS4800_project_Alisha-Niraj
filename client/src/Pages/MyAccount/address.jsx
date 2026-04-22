import { useContext, useEffect, useState } from 'react';
import AccountSidebar from '../../components/AccountSidebar';
import { MyContext } from '../../App';
import { deleteData, fetchDataFromApi } from '../../utils/api';
import AddressBox from './addressBox';
import SEO from '../../components/SEO';

export default function Address() {
  const context = useContext(MyContext);
  const [address, setAddress] = useState([]);

  useEffect(() => {
    if (context?.userData?._id) setAddress(context.userData.address_details || []);
  }, [context?.userData]);

  const removeAddress = (id) => {
    deleteData(`/api/address/${id}`).then(() => {
      fetchDataFromApi(`/api/address/get?userId=${context?.userData?._id}`).then((res) => {
        setAddress(res.data);
        context?.getUserDetails();
      });
    });
  };

  return (
    <>
      <SEO title="Addresses — VibeFit" description="" url="/address" />
      <section className="py-8 pb-16">
        <div className="container flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block w-56 shrink-0">
            <AccountSidebar />
          </div>

          <div className="flex-1 max-w-xl">
            <div className="bg-white border border-border rounded-2xl p-6">
              <h1 className="font-display font-bold text-xl mb-5">My Addresses</h1>

              <button
                onClick={() => { context?.setOpenAddressPanel(true); context?.setAddressMode('add'); }}
                className="w-full flex items-center justify-center p-4 rounded-xl border border-dashed border-accent/50 text-accent font-semibold text-sm hover:bg-accent/5 transition-colors mb-5">
                + Add New Address
              </button>

              <div className="space-y-3">
                {address?.map((addr, i) => (
                  <AddressBox key={i} address={addr} removeAddress={removeAddress} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
