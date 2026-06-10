/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Lock } from 'lucide-react';
import { auth, onAuthStateChanged, User, db, doc, getDoc, setDoc, serverTimestamp, handleFirestoreError, OperationType, collection, query, orderBy, getDocs, limit } from './firebase';
import Header from './components/Header';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Community from './pages/Community';
import API from './pages/API';
import Pricing from './pages/Pricing';
import Categories from './pages/Categories';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import CategoryDetail from './pages/CategoryDetail';
import SearchResults from './pages/SearchResults';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UploadStudio from './pages/admin/UploadStudio';
import PromptLibrary from './pages/admin/PromptLibrary';
import CategoryManager from './pages/admin/CategoryManager';
import UserAnalytics from './pages/admin/UserAnalytics';
import SystemSettings from './pages/admin/SystemSettings';
import AdminAccount from './pages/admin/AdminAccount';
import AdminNotifications from './pages/admin/Notifications';
import ImageDetailsModal from './components/ImageDetailsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ImageItem } from './types';

// Search Context for functional search
interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedImage: ImageItem | null;
  setSelectedImage: (image: ImageItem | null) => void;
  clearSearch: () => void;
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  publicCopyCount: number;
  publicViewCount: number;
  incrementPublicCopy: () => void;
  incrementPublicView: () => void;
  categories: any[];
  prompts: ImageItem[];
  setPrompts: (prompts: ImageItem[]) => void;
  refreshPrompts: () => Promise<void>;
  siteSettings: any | null;
  setSiteSettings: (settings: any) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within a SearchProvider');
  return context;
}

function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('cached_categories');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [prompts, setPrompts] = useState<ImageItem[]>(() => {
    try {
      const cached = localStorage.getItem('cached_prompts');
      return cached ? JSON.parse(cached) : [];
    } catch { 
      try {
        localStorage.removeItem('cached_prompts');
      } catch {}
      return []; 
    }
  });

  const safeSetItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`LocalStorage setItem failed for key "${key}":`, e);
      try {
        localStorage.removeItem('cached_prompts');
        localStorage.removeItem('prompts_last_fetch');
        localStorage.setItem(key, value);
      } catch (innerError) {
        console.error(`LocalStorage fallback failed for key "${key}":`, innerError);
      }
    }
  };

  const safeCachePrompts = (images: ImageItem[]) => {
    try {
      safeSetItem('cached_prompts', JSON.stringify(images));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for prompts, trying with smaller set');
      try {
        safeSetItem('cached_prompts', JSON.stringify(images.slice(0, 20)));
      } catch (e2) {
        try {
          localStorage.removeItem('cached_prompts');
        } catch {}
      }
    }
  };

  const [siteSettings, setSiteSettings] = useState<any | null>(() => {
    try {
      const cached = localStorage.getItem('cached_site_settings');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [publicCopyCount, setPublicCopyCount] = useState(() => {
    return parseInt(localStorage.getItem('publicCopyCount') || '0');
  });
  const [publicViewCount, setPublicViewCount] = useState(() => {
    return parseInt(localStorage.getItem('publicViewCount') || '0');
  });

  useEffect(() => {
    safeSetItem('publicCopyCount', publicCopyCount.toString());
  }, [publicCopyCount]);

  useEffect(() => {
    safeSetItem('publicViewCount', publicViewCount.toString());
  }, [publicViewCount]);

  const incrementPublicCopy = () => setPublicCopyCount(prev => prev + 1);
  const incrementPublicView = () => setPublicViewCount(prev => prev + 1);

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    const fetchCategories = async () => {
      const lastFetch = localStorage.getItem('categories_last_fetch');
      const now = Date.now();
      if (categories.length > 0 && lastFetch && now - parseInt(lastFetch) < 1000 * 60 * 60) {
        return;
      }
      try {
        const q = query(collection(db, 'categories'), orderBy('count', 'desc'));
        const snapshot = await getDocs(q);
        const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
        safeSetItem('cached_categories', JSON.stringify(cats));
        safeSetItem('categories_last_fetch', now.toString());
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();

    const fetchSettings = async () => {
      const lastFetch = localStorage.getItem('settings_last_fetch');
      const now = Date.now();
      if (siteSettings && lastFetch && now - parseInt(lastFetch) < 1000 * 60 * 60 * 4) {
        return;
      }
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setSiteSettings(data);
          safeSetItem('cached_site_settings', JSON.stringify(data));
          safeSetItem('settings_last_fetch', now.toString());
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();

    const fetchPromptsData = async () => {
      const lastFetch = localStorage.getItem('prompts_last_fetch');
      const now = Date.now();
      if (prompts.length > 0 && lastFetch && now - parseInt(lastFetch) < 1000 * 60 * 30) {
        return;
      }
      try {
        const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImageItem));
        setPrompts(images);
        safeCachePrompts(images);
        safeSetItem('prompts_last_fetch', now.toString());
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };

    fetchPromptsData();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const isAdminEmail = currentUser.email === 'bayajid12am@gmail.com';
            
            if (userDoc.exists()) {
              const data = userDoc.data();
              // Force admin role if it's the admin email but role is different in DB
              if (isAdminEmail && data.role !== 'admin') {
                const updatedProfile = { ...data, role: 'admin' };
                await setDoc(doc(db, 'users', currentUser.uid), updatedProfile, { merge: true });
                setUserProfile(updatedProfile);
              } else {
                setUserProfile(data);
              }
            } else {
              const newProfile = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                role: isAdminEmail ? 'admin' : 'user',
                plan: 'Free',
                createdAt: serverTimestamp()
              };
              await setDoc(doc(db, 'users', currentUser.uid), newProfile);
              setUserProfile(newProfile);
            }
          } catch (error) {
            try {
              handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
            } catch (e) {
              setError(e);
            }
          }
        } else {
          setUserProfile(null);
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      setError(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshPrompts = useCallback(async () => {
    try {
      const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImageItem));
      setPrompts(images);
      safeCachePrompts(images);
      safeSetItem('prompts_last_fetch', Date.now().toString());
    } catch (error) {
      console.error('Error refreshing prompts:', error);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
  }, []);

  return (
    <SearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      selectedCategory, 
      setSelectedCategory,
      selectedImage,
      setSelectedImage,
      clearSearch,
      user,
      userProfile,
      loading,
      publicCopyCount,
      publicViewCount,
      incrementPublicCopy,
      incrementPublicView,
      categories,
      prompts,
      setPrompts,
      refreshPrompts,
      siteSettings,
      setSiteSettings
    }}>
      {children}
    </SearchContext.Provider>
  );
}

function Footer() {
  const { siteSettings } = useSearch();
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-6 mt-20">
      <div className="max-w-[2560px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-black font-medium">
        <div className="flex items-center gap-2">
          <span>© 2026 {siteSettings?.siteName || "AiPromp"}. All rights reserved.</span>
        </div>
        <div className="flex gap-8 items-center">
          <Link to="/about" className="hover:opacity-70 transition-colors">About</Link>
          <Link to="/contact" className="hover:opacity-70 transition-colors">Contact</Link>
          <Link to="/privacy" className="hover:opacity-70 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:opacity-70 transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <SearchProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SearchProvider>
  );
}

function AppContent() {
  const { selectedImage, setSelectedImage, userProfile, user, loading, siteSettings } = useSearch();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [show2FA, setShow2FA] = useState(false);
  const [pin, setPin] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (isAdminRoute && userProfile?.twoFactorEnabled && !isVerified) {
      setShow2FA(true);
    } else {
      setShow2FA(false);
    }
  }, [isAdminRoute, userProfile, isVerified]);

  const verifyPin = () => {
    if (pin === userProfile?.securityPin) {
      setIsVerified(true);
      setShow2FA(false);
    } else {
      alert('Incorrect PIN');
    }
  };

  if (isAdminRoute && !loading && userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (show2FA) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[40px] p-10 text-center">
          <div className="w-20 h-20 bg-admin-accent/10 rounded-3xl flex items-center justify-center text-admin-accent mx-auto mb-8">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Security Check</h2>
          <p className="text-slate-500 font-medium mb-10">Enter your 2FA security PIN to access the admin panel.</p>
          
          <div className="space-y-6">
            <input 
              type="password" 
              maxLength={6}
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 text-3xl font-black tracking-[1em] text-center text-slate-900 focus:outline-none focus:border-admin-accent transition-colors"
            />
            <button 
              onClick={verifyPin}
              className="w-full py-5 bg-admin-accent text-white rounded-2xl font-bold text-lg hover:bg-admin-accent/90 transition-all shadow-xl shadow-admin-accent/20"
            >
              Verify & Access
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors"
            >
              Back to {siteSettings?.siteName || "Site"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      {!isAdminRoute && <Header />}
      <main>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/community" element={<Community />} />
            <Route path="/api" element={<API />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:categoryName" element={<CategoryDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/account" element={<Account />} />
            <Route path="/search" element={<SearchResults />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="upload" element={<UploadStudio />} />
              <Route path="library" element={<PromptLibrary />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="analytics" element={<UserAnalytics />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="account" element={<AdminAccount />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </main>
      {!isAdminRoute && <Footer />}
      <ImageDetailsModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}

