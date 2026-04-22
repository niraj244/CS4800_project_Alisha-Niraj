import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaRegUser } from 'react-icons/fa';
import { IoBagCheckOutline, IoMdHeartEmpty } from 'react-icons/io';
import { IoIosLogOut } from 'react-icons/io';
import { LuMapPin } from 'react-icons/lu';
import { MyContext } from '../../App';
import { fetchDataFromApi, uploadImage } from '../../utils/api';

const NAV = [
  { to: '/my-account', icon: FaRegUser, label: 'My Profile' },
  { to: '/address', icon: LuMapPin, label: 'Address' },
  { to: '/my-list', icon: IoMdHeartEmpty, label: 'Wishlist' },
  { to: '/my-orders', icon: IoBagCheckOutline, label: 'My Orders' },
];

export default function AccountSidebar() {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (context?.userData?.avatar) setPreview(context.userData.avatar);
  }, [context?.userData]);

  const onChangeFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      context.alertBox('error', 'Please select a valid JPG, PNG, or WebP image');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    uploadImage('/api/user/user-avatar', fd).then((res) => {
      setUploading(false);
      setPreview(res?.data?.avtar || '');
      context.alertBox('success', 'Profile picture updated!');
      fetchDataFromApi('/api/user/user-details').then((r) => context?.setUserData(r.data));
    });
  };

  const logout = () => {
    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem('accessToken')}`).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        context.setUserData(null);
        context?.setCartData([]);
        context?.setMyListData([]);
        navigate('/');
      }
    });
  };

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden sticky top-24">
      <div className="flex flex-col items-center p-5 border-b border-border">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface-alt mb-3 group">
          {uploading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <img src={preview || '/user.jpg'} alt="avatar" className="w-full h-full object-cover" />
          )}
          <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <FaCloudUploadAlt size={20} className="text-white" />
            <input type="file" accept="image/*" className="sr-only" onChange={onChangeFile} />
          </label>
        </div>
        <p className="font-semibold text-sm">{context?.userData?.name}</p>
        <p className="text-xs text-text-muted truncate max-w-full">{context?.userData?.email}</p>
      </div>

      <nav className="py-2">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-accent/10 text-accent border-r-2 border-accent' : 'text-text-muted hover:bg-surface-alt hover:text-text-primary'}`
            }>
            <Icon size={16} /> {label}
          </NavLink>
        ))}
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-alt hover:text-danger transition-colors">
          <IoIosLogOut size={16} /> Logout
        </button>
      </nav>
    </div>
  );
}
