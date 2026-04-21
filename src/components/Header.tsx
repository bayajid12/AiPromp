import { Search, Menu, X, Image as ImageIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSearch } from '../App';
import { auth, signOut, googleProvider, signInWithPopup } from '../firebase';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearSearch, searchQuery, setSearchQuery, user, userProfile } = useSearch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search');
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Show search in header when scrolled past hero search (approx 300px)
      setIsScrolled(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[2560px] mx-auto px-6 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" onClick={clearSearch} className="flex items-center cursor-pointer shrink-0">
          <span className="font-bold text-2xl md:text-3xl tracking-tighter">
            <span className="text-[#7C3AED]">Ai</span>
            <span className="bg-gradient-to-r from-[#F59E0B] via-[#EF4444] to-[#A855F7] bg-clip-text text-transparent">Promp</span>
          </span>
        </Link>

        {/* Search Bar - Shown on Scroll */}
        <div className="flex-1 max-w-xl hidden md:block">
          <AnimatePresence>
            {isScrolled && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                className="w-full"
              >
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors" size={18} />
                  <form onSubmit={handleSearch}>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search prompts..."
                      className="w-full bg-[#F5F5F5] border-none rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none transition-all"
                    />
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-8 shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={link.path === '/' ? clearSearch : undefined}
              className={`text-base font-medium transition-colors ${
                location.pathname === link.path ? 'text-black' : 'text-black/50 hover:text-black'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 px-4 py-2 bg-admin-accent/10 text-admin-accent rounded-xl font-bold text-sm hover:bg-admin-accent/20 transition-all"
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden xl:block">Admin Panel</span>
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
                  <Link to="/account" className="flex items-center gap-2 group">
                    <img src={userProfile?.photoURL || user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-gray-200 group-hover:border-black transition-colors" />
                    <span className="text-sm font-bold text-black/60 group-hover:text-black transition-colors hidden xl:block">Account</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-black transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Search Button (Shown on scroll) */}
          {isScrolled && (
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-gray-50 rounded-full lg:hidden text-black"
            >
              <Search size={22} />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-50 rounded-full lg:hidden text-black"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <span className="font-bold text-xl tracking-tighter">
                  <span className="text-[#7C3AED]">Ai</span>
                  <span className="bg-gradient-to-r from-[#F59E0B] via-[#EF4444] to-[#A855F7] bg-clip-text text-transparent">Promp</span>
                </span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-50 rounded-full text-black"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
                  <form onSubmit={handleSearch}>
                    <input 
                      type="text"
                      autoFocus={isScrolled}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search prompts..."
                      className="w-full bg-[#F5F5F5] border-none rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </form>
                </div>

                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`px-4 py-3 rounded-xl text-lg font-bold transition-colors ${
                        location.pathname === link.path 
                          ? 'bg-black text-white' 
                          : 'text-black/60 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                <div className="h-px bg-gray-100 w-full" />

                <div className="flex flex-col gap-3">
                  {user ? (
                    <>
                      <Link to="/account" className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <img src={userProfile?.photoURL || user.photoURL || ''} alt="User" className="w-12 h-12 rounded-full" />
                        <div>
                          <p className="font-bold text-black">{userProfile?.displayName || user.displayName}</p>
                          <p className="text-xs text-black/40">View Profile</p>
                        </div>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full py-4 border border-gray-200 rounded-xl text-center font-bold text-black"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleLogin}
                        className="w-full py-4 bg-black text-white rounded-xl text-center font-bold text-lg shadow-lg shadow-black/10"
                      >
                        Login with Google
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 text-center">
                <p className="text-xs text-black/40 font-medium">© 2026 AiPromp. All rights reserved.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
