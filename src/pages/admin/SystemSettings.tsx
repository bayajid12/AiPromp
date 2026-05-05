import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Lock, 
  Bell, 
  Database, 
  Palette,
  Save,
  ShieldCheck,
  Key,
  Camera,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSearch } from '../../App';
import { db, doc, setDoc, handleFirestoreError, OperationType } from '../../firebase';
import { compressImage } from '../../lib/imageUtils';

export default function SystemSettings() {
  const { siteSettings, setSiteSettings } = useSearch();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    supportEmail: '',
    logoUrl: '',
    maintenanceMode: false
  });

  useEffect(() => {
    if (siteSettings) {
      setFormData({
        siteName: siteSettings.siteName || '',
        supportEmail: siteSettings.supportEmail || '',
        logoUrl: siteSettings.logoUrl || '',
        maintenanceMode: siteSettings.maintenanceMode || false
      });
    }
  }, [siteSettings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedLogo = await compressImage(file, 400); // Logo doesn't need to be huge
      setFormData(prev => ({ ...prev, logoUrl: compressedLogo }));
    } catch (error) {
      console.error('Logo upload failed:', error);
      alert('Failed to upload logo');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), formData, { merge: true });
      setSiteSettings(formData);
      alert('Settings saved successfully!');
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, 'settings/general');
      } catch (e: any) {
        alert('Failed to save settings: ' + e.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'api', name: 'API Config', icon: Key },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">System Settings</h1>
        <p className="text-slate-500 font-medium">Configure global platform parameters and security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-admin-accent text-white' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white border border-admin-border rounded-[32px] p-10">
          {activeTab === 'general' && (
            <div className="space-y-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-admin-accent/10 rounded-2xl flex items-center justify-center text-admin-accent">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">General Settings</h3>
                  <p className="text-sm text-slate-500">Basic platform information and configuration.</p>
                </div>
              </div>

              {/* Logo Section */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Website Logo</label>
                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-slate-50 border border-admin-border rounded-[32px]">
                  <div className="relative group">
                    <div className="w-48 h-24 bg-white border border-admin-border rounded-2xl flex items-center justify-center overflow-hidden">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain p-4" />
                      ) : (
                        <div className="text-center">
                          <Palette className="mx-auto text-slate-200 mb-2" size={32} />
                          <span className="text-[10px] font-bold text-slate-400">NO LOGO</span>
                        </div>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-admin-accent text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all">
                      <Camera size={18} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h4 className="font-bold text-slate-900">Brand Identity</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      This logo will appear in the main website header and the admin panel sidebar. 
                      Recommended: Transparent PNG, maximum height 120px.
                    </p>
                    {formData.logoUrl && (
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                        className="text-xs font-bold text-rose-500 hover:underline"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Site Name</label>
                  <input 
                    type="text" 
                    value={formData.siteName} 
                    onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                  <input 
                    type="email" 
                    value={formData.supportEmail} 
                    onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
                    className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Maintenance Mode</label>
                  <div className="flex items-center gap-3 h-[56px] px-6 bg-slate-50 border border-admin-border rounded-2xl">
                    <input 
                      type="checkbox" 
                      checked={formData.maintenanceMode}
                      onChange={(e) => setFormData(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-admin-accent focus:ring-admin-accent" 
                    />
                    <span className="text-sm font-medium text-slate-600">Enable Maintenance Mode</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-admin-accent/10 rounded-2xl flex items-center justify-center text-admin-accent">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">API Configuration</h3>
                  <p className="text-sm text-slate-500">Manage external service integrations and keys.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Gemini API Key</label>
                  <div className="relative">
                    <input type="password" value="••••••••••••••••••••••••••••" readOnly className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors" />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-admin-accent hover:underline">Reveal</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {(activeTab === 'security' || activeTab === 'notifications') && (
            <div className="py-20 text-center">
              <Settings className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-500 font-medium">This section is under development.</p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-admin-border flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-4 bg-admin-accent text-white rounded-2xl font-bold hover:bg-admin-accent/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
