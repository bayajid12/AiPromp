import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Library, 
  Settings, 
  Users, 
  Grid, 
  Bell, 
  Search, 
  ChevronDown,
  Menu,
  X,
  ArrowLeft,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSearch } from '../../App';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Upload Studio', icon: Upload, path: '/admin/upload' },
  { name: 'Prompt Library', icon: Library, path: '/admin/library' },
  { name: 'Category Manager', icon: Grid, path: '/admin/categories' },
  { name: 'User Analytics', icon: Users, path: '/admin/analytics' },
  { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { name: 'Account', icon: UserCircle, path: '/admin/account' },
  { name: 'System Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, userProfile } = useSearch();

  return (
    <div className="min-h-screen bg-admin-bg text-slate-900 font-sans selection:bg-admin-accent/30">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-admin-border transition-all duration-300 z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-admin-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-black text-white italic">A</span>
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-black tracking-tighter italic text-slate-900">AiPromp</span>
          )}
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-admin-accent text-white" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon size={20} className={cn("flex-shrink-0", isActive ? "text-white" : "group-hover:text-slate-900")} />
                {isSidebarOpen && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-admin-border">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <ArrowLeft size={20} className="flex-shrink-0 group-hover:text-slate-900" />
              {isSidebarOpen && (
                <span className="text-sm font-medium">Back to Site</span>
              )}
            </Link>
          </div>
        </nav>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl bg-white border border-admin-border flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-500"
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "transition-all duration-300 min-h-screen",
          isSidebarOpen ? "pl-64" : "pl-20"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-admin-border px-8 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search prompts or IDs..."
              className="w-full bg-slate-50 border border-admin-border rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors"
            />
          </div>

          <div className="flex items-center gap-6">
            <Link to="/admin/notifications" className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-admin-accent rounded-full border-2 border-white"></span>
            </Link>
            
            <Link to="/admin/account" className="flex items-center gap-3 pl-6 border-l border-admin-border group cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{user?.displayName || 'Admin User'}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{userProfile?.role || 'Super Admin'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-admin-accent/10 border border-admin-accent/20 flex items-center justify-center overflow-hidden">
                <img src={user?.photoURL || "https://picsum.photos/seed/admin/100/100"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
