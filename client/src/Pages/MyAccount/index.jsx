import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import AccountSidebar from '../../components/AccountSidebar';
import { MyContext } from '../../App';
import { editData, postData } from '../../utils/api';
import SEO from '../../components/SEO';

export default function MyAccount() {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);
  const [phone, setPhone] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', mobile: '' });
  const [pwForm, setPwForm] = useState({ email: '', oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) navigate('/');
  }, [context?.isLogin]);

  useEffect(() => {
    if (context?.userData?._id) {
      setForm({ name: context.userData.name || '', email: context.userData.email || '', mobile: context.userData.mobile || '' });
      setPhone(context.userData.mobile || '');
      setPwForm((f) => ({ ...f, email: context.userData.email || '' }));
    }
  }, [context?.userData]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onChangePw = (e) => setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) { context.alertBox('error', 'Please enter full name'); return; }
    setIsLoading(true);
    editData(`/api/user/${context.userData._id}`, form).then((res) => {
      setIsLoading(false);
      if (res?.error !== true) context.alertBox('success', res?.data?.message);
      else context.alertBox('error', res?.data?.message);
    });
  };

  const handleSubmitChangePw = (e) => {
    e.preventDefault();
    if (!pwForm.newPassword || !pwForm.confirmPassword) { context.alertBox('error', 'Please fill in all fields'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { context.alertBox('error', 'Passwords do not match'); return; }
    setIsLoading2(true);
    postData('/api/user/reset-password', pwForm).then((res) => {
      setIsLoading2(false);
      if (res?.error !== true) context.alertBox('success', res?.message);
      else context.alertBox('error', res?.message);
    });
  };

  return (
    <>
      <SEO title="My Account — VibeFit" description="" url="/my-account" />
      <section className="py-8 pb-16">
        <div className="container flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block w-56 shrink-0">
            <AccountSidebar />
          </div>

          <div className="flex-1 max-w-xl space-y-5">
            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="font-display font-bold text-xl">My Profile</h1>
                <button onClick={() => setShowPwSection((v) => !v)}
                  className="text-sm text-accent hover:underline">
                  {showPwSection ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Full Name</label>
                  <input name="name" value={form.name} onChange={onChange}
                    placeholder="Your name" className="input w-full" disabled={isLoading} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <input type="email" name="email" value={form.email}
                    className="input w-full opacity-60" disabled />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Mobile</label>
                  <PhoneInput defaultCountry="np" value={phone}
                    onChange={(p) => { setPhone(p); setForm((f) => ({ ...f, mobile: p })); }}
                    disabled={isLoading} />
                </div>
                <button type="submit" disabled={isLoading || !form.name}
                  className="btn-accent py-2.5 px-6 disabled:opacity-60">
                  {isLoading ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {showPwSection && (
              <div className="bg-white border border-border rounded-2xl p-6">
                <h2 className="font-display font-bold text-lg mb-4">Change Password</h2>
                <form onSubmit={handleSubmitChangePw} className="space-y-4">
                  {context?.userData?.signUpWithGoogle === false && (
                    <div>
                      <label className="block text-sm font-semibold mb-1">Current Password</label>
                      <div className="relative">
                        <input type={showOld ? 'text' : 'password'} name="oldPassword"
                          value={pwForm.oldPassword} onChange={onChangePw}
                          placeholder="••••••••" className="input w-full pr-10" />
                        <button type="button" onClick={() => setShowOld((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                          {showOld ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                  {[
                    { label: 'New Password', name: 'newPassword', show: showNew, toggle: setShowNew },
                    { label: 'Confirm Password', name: 'confirmPassword', show: showConfirm, toggle: setShowConfirm },
                  ].map(({ label, name, show, toggle }) => (
                    <div key={name}>
                      <label className="block text-sm font-semibold mb-1">{label}</label>
                      <div className="relative">
                        <input type={show ? 'text' : 'password'} name={name}
                          value={pwForm[name]} onChange={onChangePw}
                          placeholder="••••••••" className="input w-full pr-10" />
                        <button type="button" onClick={() => toggle((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                          {show ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={isLoading2}
                    className="btn-accent py-2.5 px-6 disabled:opacity-60">
                    {isLoading2 ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
