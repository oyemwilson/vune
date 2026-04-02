import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { resetCart } from '../slices/cartSlice';
import { useState, useEffect, useRef } from 'react';
import SearchBox from './SearchBox';
import { FaShoppingCart, FaUser, FaHeart, FaBars, FaCrown } from 'react-icons/fa';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50); // trigger after 50px
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  const userDropdownRef = useRef();
  const adminDropdownRef = useRef();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target)) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      {/* Promo */}
      {/* TOP STATIC BAR */}
<div className="bg-[#390F0F] text-white text-sm font-libre-sans-serif py-2 text-center tracking-wide">
  🌟 FREE SHIPPING ON ALL ORDERS ABOVE ₦50 · SHOP WITH CONFIDENCE
</div>

      {/* MOVING MARQUEE BAR */}
      <div className="relative bg-[#ffefc0] overflow-hidden h-10 text-lg flex items-center text-yellow-900 border-t border-b border-black">
        <div className="marquee-wrapper flex whitespace-nowrap">
          <span className="marquee-content">
            BUY MORE · SAVE MORE · GET REWARDED · FREE RETURNS · EXCLUSIVE DEALS · BUY MORE · SAVE MORE · GET REWARDED · FREE RETURNS · EXCLUSIVE DEALS · BUY MORE · SAVE MORE · GET REWARDED · FREE RETURNS · EXCLUSIVE DEALS · BUY MORE · SAVE MORE · GET REWARDED · FREE RETURNS · EXCLUSIVE DEALS
          </span>
          <span className="marquee-content">
            BUY MORE · SAVE MORE · GET REWARDED · FREE RETURNS · EXCLUSIVE DEALS · BUY MORE · SAVE MORE · GET REWARDED · FREE RETURNS · EXCLUSIVE DEALS · BUY MORE · SAVE MORE · GET REWARDED · FREE RETURNS · EXCLUSIVE DEALS · BUY MORE · SAVE MORE · GET REWARDED · FREE RETURNS · EXCLUSIVE DEALS
          </span>
        </div>
      </div>




      {/* TOP BAR */}
      <div className='sm:bg-[#faf2e7] bg-[#FAFFDB]'>


        <div className=" mx-auto px-4  sm:px-6 lg:px-8 py-2 flex items-center justify-between relative">
          {/* LEFT SIDE on small screen */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-black focus:outline-none"
            >
              <FaBars className="w-6 h-6" />
            </button>
            {/* Heart */}
            <Link to="/wishlist" className="text-gray-700 hover:text-red-500">
              <FaHeart className="w-5 h-5" />
            </Link>
          </div>

          {/* LEFT SIDE on large screen */}
          <div className="hidden md:flex items-center space-x-3 ps-10">
            {/* Search on large screens */}
            <div className="w-[400px]">
              <SearchBox />
            </div>
          </div>

          {/* CENTER LOGO */}
          <Link
            to="/"
            className="text-xl md:text-4xl font-extrabold tracking-widest text-gray-900 absolute left-1/2 transform -translate-x-1/2"
          >
            VUNÈ
          </Link>

          {/* RIGHT SIDE icons */}
          <div className="flex items-center space-x-6 ml-auto md:pe-32">
            {/* Heart only on large */}
            <Link to="/wishlist" className="hidden md:inline-block text-gray-700 hover:text-red-500">
              <FaHeart className="w-5 h-5" />
            </Link>
            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-black">
              <FaShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-md px-1.5 py-0.5">
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </span>
              )}
            </Link>
            {/* User dropdown */}
            {userInfo ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="text-gray-700 hover:text-black"
                >
                  <FaUser className="w-5 h-5" />
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-black">
                <FaUser className="w-5 h-5" />
              </Link>
            )}
            {/* Admin dropdown */}
            {userInfo && userInfo.isAdmin && (
              <div className="relative" ref={adminDropdownRef}>
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="text-yellow-500 hover:text-yellow-600"
                >
                  <FaCrown className="w-5 h-5" />
                </button>
                {adminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <Link
                      to="/admin/productlist"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Products
                    </Link>
                    <Link
                      to="/admin/orderlist"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Orders
                    </Link>
                    <Link
                      to="/admin/userlist"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Users
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NAV LINKS CENTERED BELOW LOGO */}
      <div className="hidden md:flex justify-center border-t border-gray-100 bg-[#faf2e7]">
<nav
  className={`flex items-center space-x-8 pb-3 text-sm font-medium text-gray-700 transition-all duration-300 ${
    isScrolled ? "pt-1 scale-[0.98]" : "pt-7 scale-100"
  }`}
>
          <Link to="/" className="hover:text-black transition">HOME</Link>
          <Link to="/brands" className="hover:text-black transition">BRANDS</Link>
          <Link to="/sales" className="hover:text-black transition">MEN'S</Link>
          <Link to="/sales" className="hover:text-black transition">WOMEN'S</Link>
                    <Link to="/gift-cards" className="hover:text-black transition">GIFT SET</Link>
          <Link to="/sales" className="hover:text-black transition">SALES</Link>
          <Link to="/sales" className="hover:text-black transition">CONTACT US</Link>


        </nav>
      </div>

{/* MOBILE MENU */}
{/* MOBILE MENU */}
<div
  className={`fixed top-0 left-0 h-full w-72 bg-[#faf2e7] z-50 shadow-2xl border-r border-black transform transition-transform duration-300 ease-in-out flex flex-col ${
    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
  }`}
>
  {/* Drawer Header */}
  <div className="flex items-center justify-between px-6 py-3 border-b border-black bg-[#390F0F]">
    <span className="text-white text-2xl font-extrabold tracking-widest">VUNÈ</span>
    <button
      onClick={() => setMobileMenuOpen(false)}
      className="text-white hover:text-gray-300 text-2xl font-bold leading-none"
    >
      ✕
    </button>
  </div>

  {/* Nav Links */}
  <nav className="flex flex-col flex-1 px-0 pt-4 overflow-y-auto">
    {[
      { label: 'HOME', to: '/' },
      { label: 'BRANDS', to: '/brands' },
      { label: "MEN'S", to: '/mens' },
      { label: "WOMEN'S", to: '/womens' },
      { label: 'GIFT SET', to: '/gift-set' },
      { label: 'SALES', to: '/sales' },
      { label: 'CONTACT US', to: '/gift-cards' },
    ].map(({ label, to }) => (
      <Link
        key={label}
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center justify-between px-6 py-4 text-sm font-semibold tracking-widest text-gray-800 hover:bg-[#f0e6d0] hover:text-black border-b border-gray-200 transition-colors"
      >
        {label}
        <span className="text-gray-400 text-xs">›</span>
      </Link>
    ))}
  </nav>

  {/* Drawer Footer */}
  <div className="px-6 py-5 border-t border-gray-300 text-xs text-gray-400 text-center tracking-wide">
    © 2025 VUNÈ. All rights reserved.
  </div>
</div>

      {/* OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SEARCH for mobile */}
{/* SEARCH for mobile */}
<div className="md:hidden border-y border-gray-900 py-0">
  <div className="max-w-3xl mx-auto ">
    <SearchBox />
  </div>
</div>
    </header>
  );
};

export default Header;
