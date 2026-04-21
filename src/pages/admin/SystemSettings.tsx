import React, { useState } from 'react';
import { 
  Settings, 
  Globe, 
  Lock, 
  Bell, 
  Database, 
  Palette,
  Save,
  ShieldCheck,
  Key
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');

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
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-admin-accent/10 rounded-2xl flex items-center justify-center text-admin-accent">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">General Settings</h3>
                  <p className="text-sm text-slate-500">Basic platform information and configuration.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Site Name</label>
                  <input type="text" defaultValue="AiPromp Marketplace" className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                  <input type="email" defaultValue="support@aipromp.com" className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Default Language</label>
                  <select className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors appearance-none">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Maintenance Mode</label>
                  <div className="flex items-center gap-3 h-[56px] px-6 bg-slate-50 border border-admin-border rounded-2xl">
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-admin-accent focus:ring-admin-accent" />
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
                    <input type="password" value="••••••••••••••••••••••••••••" className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors" />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-admin-accent hover:underline">Reveal</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Storage Bucket ID</label>
                  <input type="text" defaultValue="aipromp-prod-assets-01" className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors" />
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
            <button className="flex items-center gap-2 px-8 py-4 bg-admin-accent text-white rounded-2xl font-bold hover:bg-admin-accent/90 transition-all active:scale-[0.98]">
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
