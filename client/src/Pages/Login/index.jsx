import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { FcGoogle } from 'react-icons/fc';
import { MyContext } from '../../App';
import { postData } from '../../utils/api';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { firebaseApp } from '../../firebase';
import SEO from '../../components/SEO';

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export default function Login() {
  const ctx = useContext(MyContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (localStorage.getItem('accessToken')) navigate('/');
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleForgotPassword = () => {
    if (!form.email.trim()) { ctx.alertBox('error', 'Enter your email first'); return; }
    localStorage.setItem('userEmail', form.email);
    localStorage.setItem('actionType', 'forgot-password');
    postData('/api/user/forgot-password', { email: form.email }).then((res) => {
      if (res?.error === false) { ctx.alertBox('success', res.message); navigate('/verify'); }
      else ctx.alertBox('error', res?.message);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { ctx.alertBox('error', 'Please fill in all fields'); return; }
    setLoading(true);
    postData('/api/user/login', form, { withCredentials: true }).then((res) => {
      setLoading(false);
      if (res?.error !== true) {
        ctx.alertBox('success', res.message);
        localStorage.setItem('accessToken', res?.data?.accesstoken);
        localStorage.setItem('refreshToken', res?.data?.refreshToken);
        ctx.setIsLogin(true);
        if (res?.needsVerification) {
          localStorage.setItem('userEmail', form.email);
          localStorage.removeItem('actionType');
          navigate('/verify');
        } else {
          navigate('/');
        }
      } else {
        ctx.alertBox('error', res?.message);
      }
    });
  };

  const authWithGoogle = () => {
    signInWithPopup(auth, googleProvider).then((result) => {
      const user = result.user;
      postData('/api/user/authWithGoogle', {
        name: user.providerData[0].displayName,
        email: user.providerData[0].email,
        password: null,
        avatar: user.providerData[0].photoURL,
        mobile: user.providerData[0].phoneNumber,
        role: 'USER',
      }).then((res) => {
        if (res?.error !== true) {
          localStorage.setItem('accessToken', res?.data?.accesstoken);
          localStorage.setItem('refreshToken', res?.data?.refreshToken);
          ctx.setIsLogin(true);
          ctx.alertBox('success', res.message);
          navigate('/');
        } else {
          ctx.alertBox('error', res?.message);
        }
      });
    }).catch(() => {});
  };

  return (
    <>
      <SEO title="Sign In — VibeFit" description="" url="/login" />
      <section className="min-h-[70vh] flex items-center py-12">
        <div className="container max-w-sm">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <h1 className="font-display font-bold text-2xl text-center mb-1">Welcome back</h1>
            <p className="text-text-muted text-sm text-center mb-7">Sign in to your VibeFit account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email</label>
                <input
                  type="email" name="email" required autoComplete="email"
                  value={form.email} onChange={onChange}
                  placeholder="your@email.com"
                  className="input w-full"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} name="password" required autoComplete="current-password"
                    value={form.password} onChange={onChange}
                    placeholder="••••••••"
                    className="input w-full pr-10"
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                    {showPw ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                  </button>
                </div>
              </div>

              <button type="button" onClick={handleForgotPassword}
                className="text-sm text-accent hover:underline">
                Forgot password?
              </button>

              <button type="submit" disabled={loading || !form.email || !form.password}
                className="btn-accent w-full py-3 disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-text-muted">or continue with</span></div>
            </div>

            <button onClick={authWithGoogle}
              className="w-full flex items-center justify-center gap-3 border border-border rounded-md py-2.5 text-sm font-medium hover:bg-surface-alt transition-colors">
              <FcGoogle size={20} /> Sign in with Google
            </button>

            <p className="text-center text-sm text-text-muted mt-6">
              No account? <Link to="/register" className="text-accent font-semibold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
