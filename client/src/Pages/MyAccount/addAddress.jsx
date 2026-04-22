import { useContext, useEffect, useState } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { MyContext } from '../../App';
import { deleteData, editData, fetchDataFromApi, postData } from '../../utils/api';

const ADDRESS_TYPES = ['Home', 'Office'];

export default function AddAddress() {
  const context = useContext(MyContext);
  const [phone, setPhone] = useState('');
  const [addressType, setAddressType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    address_line1: '', city: '', state: '', pincode: '',
    country: 'Nepal', mobile: '', userId: '', addressType: '', landmark: '',
  });

  useEffect(() => {
    if (context?.userData?._id) {
      setForm((f) => ({ ...f, userId: context.userData._id }));
    }
  }, [context?.userData]);

  useEffect(() => {
    if (context?.addressMode === 'edit') fetchAddress(context?.addressId);
  }, [context?.addressMode]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const reset = () => {
    setForm({ address_line1: '', city: '', state: '', pincode: '', country: 'Nepal', mobile: '', userId: context?.userData?._id || '', addressType: '', landmark: '' });
    setAddressType('');
    setPhone('');
  };

  const fetchAddress = (id) => {
    fetchDataFromApi(`/api/address/${id}`).then((res) => {
      const a = res?.address;
      if (!a) return;
      setForm({ address_line1: a.address_line1, city: a.city, state: a.state, pincode: a.pincode, country: a.country, mobile: a.mobile, userId: a.userId, addressType: a.addressType, landmark: a.landmark });
      setPhone(a.mobile);
      setAddressType(a.addressType);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.address_line1) { context.alertBox('error', 'Please enter Address Line 1'); return; }
    if (!form.city) { context.alertBox('error', 'Please enter city'); return; }
    if (!form.state) { context.alertBox('error', 'Please enter state'); return; }
    if (!form.pincode) { context.alertBox('error', 'Please enter pincode'); return; }
    if (!form.country) { context.alertBox('error', 'Please enter country'); return; }
    if (!phone || phone.length < 5) { context.alertBox('error', 'Please enter mobile number'); return; }
    if (!form.landmark) { context.alertBox('error', 'Please enter landmark'); return; }
    if (!form.addressType) { context.alertBox('error', 'Please select address type'); return; }

    setIsLoading(true);

    if (context?.addressMode === 'add') {
      postData('/api/address/add', form).then((res) => {
        setIsLoading(false);
        if (res?.error !== true) {
          context.alertBox('success', res?.message);
          context.getUserDetails();
          context.setOpenAddressPanel(false);
          reset();
        } else {
          context.alertBox('error', res?.message);
        }
      });
    } else {
      editData(`/api/address/${context?.addressId}`, form).then(() => {
        fetchDataFromApi(`/api/address/get?userId=${context?.userData?._id}`).then((res) => {
          setIsLoading(false);
          context.getUserDetails(res.data);
          context.setOpenAddressPanel(false);
          reset();
        });
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3">
      {[
        { label: 'Address Line 1', name: 'address_line1' },
        { label: 'City', name: 'city' },
        { label: 'State', name: 'state' },
        { label: 'Pincode', name: 'pincode' },
        { label: 'Country', name: 'country' },
        { label: 'Landmark', name: 'landmark' },
      ].map(({ label, name }) => (
        <div key={name}>
          <label className="block text-sm font-semibold mb-1">{label}</label>
          <input name={name} value={form[name]} onChange={onChange}
            placeholder={label} className="input w-full" disabled={isLoading} />
        </div>
      ))}

      <div>
        <label className="block text-sm font-semibold mb-1">Mobile</label>
        <PhoneInput defaultCountry="np" value={phone}
          onChange={(p) => { setPhone(p); setForm((f) => ({ ...f, mobile: p })); }} />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Address Type</label>
        <div className="flex gap-4">
          {ADDRESS_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" name="addressType" value={type}
                checked={addressType === type}
                onChange={() => { setAddressType(type); setForm((f) => ({ ...f, addressType: type })); }}
                className="accent-accent" />
              {type}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="btn-accent w-full py-3 disabled:opacity-60">
        {isLoading ? 'Saving...' : 'Save Address'}
      </button>
    </form>
  );
}
