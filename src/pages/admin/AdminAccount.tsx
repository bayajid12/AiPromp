import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Lock,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearch } from '../../App';
import { db, doc, updateDoc, handleFirestoreError, OperationType, auth, signOut } from '../../firebase';
import { useNavigate } from 'react-router-dom';

export default function AdminAccount() {
  const { user, userProfile } = useSearch();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 2FA States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setTwoFactorEnabled(userProfile.twoFactorEnabled || false);
      setSecurityPin(userProfile.securityPin || '');
    }
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      
      const base64Image = await base64Promise;
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: base64Image
      });
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        twoFactorEnabled,
        securityPin
      });
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowPinSetup(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your administrative profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Profile Card */}
        <div className="space-y-6">
          <div className="bg-white border border-admin-border rounded-[32px] p-8 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[40px] bg-admin-accent/10 border-4 border-white shadow-xl overflow-hidden">
                <img 
                  src={userProfile.photoURL || user?.photoURL || "https://picsum.photos/seed/admin/200/200"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-admin-border rounded-xl flex items-center justify-center text-slate-500 hover:text-admin-accent transition-colors shadow-lg cursor-pointer">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-1">{userProfile.displayName || 'Admin User'}</h2>
            <p className="text-sm font-bold text-admin-accent uppercase tracking-widest mb-6">{userProfile.role}</p>
            
            <div className="pt-6 border-t border-slate-50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">Member Since</span>
                <span className="text-slate-900 font-bold">
                  {userProfile.createdAt?.toDate ? userProfile.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">Account Status</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-black uppercase tracking-wider">Active</span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full mt-8 py-3 bg-rose-50 text-rose-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-[32px] p-8 text-white">
            <Shield className="text-admin-accent mb-4" size={32} />
            <h3 className="text-lg font-bold mb-2">Two-Factor Auth</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Add an extra layer of security to your admin account by requiring a PIN on login.
            </p>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-admin-accent" />
                <span className="text-sm font-bold">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <button 
                onClick={() => {
                  if (!twoFactorEnabled) setShowPinSetup(true);
                  else setTwoFactorEnabled(false);
                }}
                className={`w-12 h-6 rounded-full transition-all relative ${twoFactorEnabled ? 'bg-admin-accent' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${twoFactorEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-admin-border rounded-[32px] p-10">
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-50 border border-admin-border rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-admin-accent transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      value={userProfile.email}
                      disabled
                      className="w-full bg-slate-50 border border-admin-border rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={userProfile.role}
                      disabled
                      className="w-full bg-slate-50 border border-admin-border rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-400 cursor-not-allowed uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Plan</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={userProfile.plan || 'Enterprise'}
                      disabled
                      className="w-full bg-slate-50 border border-admin-border rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500">
                  <AlertCircle size={20} />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isUpdating || (displayName.trim() === userProfile.displayName && twoFactorEnabled === userProfile.twoFactorEnabled && securityPin === userProfile.securityPin)}
                  className="px-10 py-4 bg-admin-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-admin-accent/90 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {showPinSetup && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-admin-accent rounded-[32px] p-10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-admin-accent/10 rounded-2xl flex items-center justify-center text-admin-accent">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Setup Security PIN</h3>
                  <p className="text-slate-500 text-sm">Create a 4-6 digit PIN for 2FA.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Security PIN</label>
                  <input 
                    type="password" 
                    maxLength={6}
                    placeholder="••••••"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-admin-border rounded-2xl py-4 px-6 text-2xl font-black tracking-[1em] text-center text-slate-900 focus:outline-none focus:border-admin-accent transition-colors"
                  />
                </div>
                <button 
                  onClick={() => {
                    if (securityPin.length >= 4) {
                      setTwoFactorEnabled(true);
                      setShowPinSetup(false);
                    }
                  }}
                  className="w-full py-4 bg-admin-accent text-white rounded-2xl font-bold hover:bg-admin-accent/90 transition-all"
                >
                  Confirm PIN
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 right-10 z-[100] bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3"
          >
            <CheckCircle2 size={20} />
            <span className="font-bold">Profile Updated Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
