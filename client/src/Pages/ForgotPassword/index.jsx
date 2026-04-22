import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { MyContext } from '../../App';
import { postData } from '../../utils/api';
import SEO from '../../components/SEO';

export default function ForgotPassword() {
  const ctx = useContext(MyContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: localStorage.getItem('userEmail') || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.newPassword || !form.confirmPassword) { ctx.alertBox('error', 'Please fill in all fields'); return; }
    if (form.newPassword !== form.confirmPassword) { ctx.alertBox('error', 'Passwords do not match'); return; }
    setLoading(true);
    postData('/api/user/forgot-password/change-password', form).then((res) => {
      setLoading(false);
      if (res?.error === false) {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('actionType');
        ctx.alertBox('success', res.message);
        navigate('/login');
      } else {
        ctx.alertBox('error', res?.message);
      }
    });
  };

  return (
    <>
      <SEO title="Reset Password — VibeFit" description="" url="/forgot-password" />
      <section className="min-h-[70vh] flex items-center py-12">
        <div className="container max-w-sm">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <h1 className="font-display font-bold text-2xl text-center mb-1">Set new password</h1>
            <p className="text-text-muted text-sm text-center mb-7">
              Resetting password for <span className="font-semibold text-text-primary">{form.email}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'New Password', name: 'newPassword', showKey: 'new' },
                { label: 'Confirm Password', name: 'confirmPassword', showKey: 'confirm' },
              ].map(({ label, name, showKey }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={show[showKey] ? 'text' : 'password'} name={name} required
                      value={form[name]} onChange={onChange}
                      placeholder="••••••••" className="input w-full pr-10" disabled={loading}
                    />
                    <button type="button" onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                      {show[showKey] ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                    </button>
                  </div>
                </div>
              ))}

              <button type="submit" disabled={loading || !form.newPassword || !form.confirmPassword}
                className="btn-accent w-full py-3 disabled:opacity-60">
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
