import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Calendar, Copy, Share2, LogOut, Settings, Camera } from 'lucide-react';
import { useSearch } from '../App';
import { auth, signOut, db, collection, query, where, getDocs, handleFirestoreError, OperationType } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ImageCard } from '../components/ImageCard';

export default function Account() {
  const { user, userProfile } = useSearch();
  const navigate = useNavigate();
  const [userPrompts, setUserPrompts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'my-prompts' | 'favorites'>('my-prompts');

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserPrompts = async () => {
      try {
        // Fetch prompts created by this user
        const q = query(collection(db, 'prompts'), where('authorId', '==', user.uid));
        const snapshot = await getDocs(q);
        const prompts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserPrompts(prompts);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'prompts');
        } catch (e) {
          setError(e);
        }
      }
    };

    fetchUserPrompts();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user || !userProfile) return null;

  const stats = [
    { label: 'Total Prompts', value: userPrompts.length, icon: Camera },
    { label: 'Total Copies', value: userPrompts.reduce((acc, p) => acc + (p.copies || 0), 0), icon: Copy },
    { label: 'Total Shares', value: userPrompts.reduce((acc, p) => acc + (p.shares || 0), 0), icon: Share2 },
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white border border-gray-100 rounded-[40px] p-8 md:p-12 mb-12 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <img 
                src={userProfile.photoURL || user.photoURL || 'https://picsum.photos/seed/user/200/200'} 
                alt={userProfile.displayName} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] object-cover border-4 border-white shadow-xl"
              />
              <div className="absolute inset-0 bg-black/40 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Settings className="text-white" size={24} />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black text-black">{userProfile.displayName || 'Anonymous User'}</h1>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    userProfile.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-black text-white'
                  }`}>
                    {userProfile.role || 'User'}
                  </span>
                </div>
                <p className="text-black/40 font-medium flex items-center justify-center md:justify-start gap-2">
                  <Mail size={16} />
                  {user.email}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-sm font-bold text-black/60">
                  <Calendar size={16} />
                  Joined {userProfile.createdAt?.toDate ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-black/60">
                  <Shield size={16} />
                  {userProfile.plan || 'Free'} Plan
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-50 text-black rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-gray-100 p-8 rounded-3xl flex items-center gap-6"
            >
              <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center text-black">
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-black">{stat.value.toLocaleString()}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Tabs */}
        <div className="space-y-8">
          <div className="flex items-center gap-8 border-b border-gray-100 pb-4">
            <button 
              onClick={() => setActiveTab('my-prompts')}
              className={`text-lg font-bold transition-all relative ${
                activeTab === 'my-prompts' ? 'text-black' : 'text-black/40 hover:text-black'
              }`}
            >
              My Prompts
              {activeTab === 'my-prompts' && (
                <motion.div layoutId="tab" className="absolute -bottom-[17px] left-0 right-0 h-1 bg-black rounded-full" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`text-lg font-bold transition-all relative ${
                activeTab === 'favorites' ? 'text-black' : 'text-black/40 hover:text-black'
              }`}
            >
              Favorites
              {activeTab === 'favorites' && (
                <motion.div layoutId="tab" className="absolute -bottom-[17px] left-0 right-0 h-1 bg-black rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'my-prompts' ? (
            userPrompts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {userPrompts.map((image) => (
                  <ImageCard key={image.id} image={image} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                <Camera className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-bold mb-2">No prompts yet</h3>
                <p className="text-black/40 mb-8">
                  {userProfile.role === 'admin' 
                    ? 'Start sharing your creative prompts with the community!' 
                    : 'You haven\'t shared any prompts yet. Only admins can upload new prompts currently.'}
                </p>
                {userProfile.role === 'admin' && (
                  <button 
                    onClick={() => navigate('/admin/upload')}
                    className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
                  >
                    Upload Your First Prompt
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
              <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
              <p className="text-black/40">The favorites feature is currently under development.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
