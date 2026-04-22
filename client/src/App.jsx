import React, { useEffect, useState, createContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import toast, { Toaster } from 'react-hot-toast';

import './App.css';
import './responsive.css';

import Header from './components/Header';
import Footer from './components/Footer';
import CartPanel from './components/CartPanel';

import Home from './Pages/Home';
import Shop from './Pages/Shop';
import Collections from './Pages/Collections';
import { ProductDetails } from './Pages/ProductDetails';
import CartPage from './Pages/Cart';
import Checkout from './Pages/Checkout';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Verify from './Pages/Verify';
import ForgotPassword from './Pages/ForgotPassword';
import MyAccount from './Pages/MyAccount';
import Address from './Pages/MyAccount/address';
import MyList from './Pages/MyList';
import Orders from './Pages/Orders';
import { OrderSuccess } from './Pages/Orders/success';
import { OrderFailed } from './Pages/Orders/failed';
import SearchPage from './Pages/Search';
import { Navigate } from 'react-router-dom';
import About from './Pages/About';
import Contact from './Pages/Contact';
import StaticPage from './Pages/StaticPage';

import { fetchDataFromApi, postData } from './utils/api';

const MyContext = createContext();

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [catData, setCatData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [myListData, setMyListData] = useState([]);
  const [openCartPanel, setOpenCartPanel] = useState(false);
  const [openAddressPanel, setOpenAddressPanel] = useState(false);
  const [addressMode, setAddressMode] = useState('add');
  const [addressId, setAddressId] = useState('');

  const [openProductDetailsModal, setOpenProductDetailsModal] = useState({ open: false, item: {} });
  const [searchData, setSearchData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [openFilter, setOpenFilter] = useState(false);
  const [isFilterBtnShow, setisFilterBtnShow] = useState(false);
  const [openSearchPanel, setOpenSearchPanel] = useState(false);

  const toggleCartPanel = (newOpen) => () => setOpenCartPanel(newOpen);
  const toggleAddressPanel = (newOpen) => () => {
    if (!newOpen) setAddressMode('add');
    setOpenAddressPanel(newOpen);
  };

  const handleOpenProductDetailsModal = (status, item) => setOpenProductDetailsModal({ open: status, item });
  const handleCloseProductDetailsModal = () => setOpenProductDetailsModal({ open: false, item: {} });

  const alertBox = (type, msg) => {
    if (type === 'success') toast.success(msg);
    else if (type === 'error') toast.error(msg);
    else toast(msg, { icon: 'ℹ️' });
  };

  const getUserDetails = () => {
    fetchDataFromApi('/api/user/user-details').then((res) => {
      setUserData(res.data);
      if (res?.response?.data?.error === true && res?.response?.data?.message === 'You have not login') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alertBox('error', 'Your session expired, please sign in again');
        setIsLogin(false);
      }
    });
  };

  const getCartItems = () => {
    fetchDataFromApi('/api/cart/get').then((res) => {
      if (res?.error === false) setCartData(res?.data);
    });
  };

  const getMyListData = () => {
    fetchDataFromApi('/api/myList').then((res) => {
      if (res?.error === false) setMyListData(res?.data);
    });
  };

  const addToCart = (product, userId, quantity) => {
    if (!userId) { alertBox('error', 'Please sign in first'); return false; }
    const data = {
      productTitle: product?.name,
      image: product?.images?.[0] || product?.image,
      rating: product?.rating,
      price: product?.price,
      oldPrice: product?.oldPrice,
      discount: product?.discount,
      quantity,
      subTotal: parseInt(product?.price * quantity),
      productId: product?._id,
      countInStock: product?.countInStock,
      brand: product?.brand,
      size: product?.size,
    };
    postData('/api/cart/add', data).then((res) => {
      if (res?.error === false) {
        alertBox('success', res?.message);
        getCartItems();
        setOpenCartPanel(true);
      } else {
        alertBox('error', res?.message);
      }
    });
  };

  useEffect(() => {
    localStorage.removeItem('userEmail');
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLogin(true);
      getCartItems();
      getMyListData();
      getUserDetails();
    } else {
      setIsLogin(false);
    }
  }, [isLogin]);

  useEffect(() => {
    fetchDataFromApi('/api/category').then((res) => {
      if (res?.error === false) setCatData(res?.data);
    });
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const values = {
    openProductDetailsModal, setOpenProductDetailsModal, handleOpenProductDetailsModal, handleCloseProductDetailsModal,
    setOpenCartPanel, toggleCartPanel, openCartPanel,
    setOpenAddressPanel, toggleAddressPanel, openAddressPanel,
    isLogin, setIsLogin,
    alertBox,
    setUserData, userData,
    setCatData, catData,
    addToCart, cartData, setCartData, getCartItems,
    myListData, setMyListData, getMyListData,
    getUserDetails,
    setAddressMode, addressMode, addressId, setAddressId,
    setSearchData, searchData,
    windowWidth,
    setOpenFilter, openFilter,
    setisFilterBtnShow, isFilterBtnShow,
    setOpenSearchPanel, openSearchPanel,
  };

  return (
    <HelmetProvider>
      <BrowserRouter>
        <MyContext.Provider value={values}>
          <Header />
          <CartPanel />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collections/:slug" element={<Collections />} />
            <Route path="/products" element={<Navigate to="/shop" replace />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/address" element={<Address />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/my-orders" element={<Orders />} />
            <Route path="/order/success" element={<OrderSuccess />} />
            <Route path="/order/failed" element={<OrderFailed />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/compare" element={<Navigate to="/shop" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<StaticPage page="privacy" />} />
            <Route path="/terms" element={<StaticPage page="terms" />} />
            <Route path="/returns" element={<StaticPage page="returns" />} />
          </Routes>
          <Footer />
          <Toaster position="bottom-right" />
        </MyContext.Provider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
export { MyContext };
