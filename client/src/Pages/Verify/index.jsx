import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OtpBox from '../../components/OtpBox';
import { MyContext } from '../../App';
import { postData } from '../../utils/api';
import SEO from '../../components/SEO';

export default function Verify() {
  const ctx = useContext(MyContext);
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const email = localStorage.getItem('userEmail');

  const resendOtp = () => {
    if (!email) { ctx.alertBox('error', 'Email not found'); return; }
    setResending(true);
    postData('/api/user/resend-otp', { email }).then((res) => {
      setResending(false);
      if (res?.error === false) ctx.alertBox('success', res.message);
      else ctx.alertBox('error', res?.message);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { ctx.alertBox('error', 'Please enter the 6-digit OTP'); return; }
    setLoading(true);
    const actionType = localStorage.getItem('actionType');
    const isForgotPw = actionType === 'forgot-password';

    const endpoint = isForgotPw ? '/api/user/verify-forgot-password-otp' : '/api/user/verifyEmail';
    postData(endpoint, { email, otp }).then((res) => {
      setLoading(false);
      if (res?.error === false) {
        ctx.alertBox('success', res.message);
        if (isForgotPw) {
          navigate('/forgot-password');
        } else {
          localStorage.removeItem('userEmail');
          const token = localStorage.getItem('accessToken');
          navigate(token ? '/' : '/login');
        }
      } else {
        ctx.alertBox('error', res?.message);
      }
    });
  };

  return (
    <>
      <SEO title="Verify OTP — VibeFit" description="" url="/verify" />
      <section className="min-h-[70vh] flex items-center py-12">
        <div className="container max-w-sm">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">✉️</span>
            </div>
            <h1 className="font-display font-bold text-2xl mb-2">Check your email</h1>
            <p className="text-text-muted text-sm mb-1">
              We sent a 6-digit code to
            </p>
            <p className="font-semibold text-sm mb-6">{email}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="otpBox">
                <OtpBox length={6} onChange={setOtp} />
              </div>

              <button type="submit" disabled={loading || otp.length < 6}
                className="btn-accent w-full py-3 disabled:opacity-60">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <button type="button" onClick={resendOtp} disabled={resending}
              className="mt-4 text-sm text-accent hover:underline disabled:opacity-50">
              {resending ? 'Sending...' : "Didn't receive it? Resend OTP"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
