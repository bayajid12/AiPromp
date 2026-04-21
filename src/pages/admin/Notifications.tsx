import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  MailOpen,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, handleFirestoreError, OperationType, limit } from '../../firebase';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(items);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'notifications');
        } catch (e) {
          setError(e);
        }
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.read;
    if (filter === 'Read') return n.read;
    return true;
  });

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
      } catch (e) {
        setError(e);
      }
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `notifications/${id}`);
      } catch (e) {
        setError(e);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={20} />;
      case 'error': return <AlertCircle className="text-rose-500" size={20} />;
      default: return <Bell className="text-admin-accent" size={20} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Notifications</h1>
          <p className="text-slate-500 font-medium">Stay updated with system alerts and user activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-admin-border rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors text-slate-900">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-admin-border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl w-full md:w-auto">
          {['All', 'Unread', 'Read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === f 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search notifications..."
            className="w-full bg-slate-50 border border-admin-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={notification.id}
              className={`group bg-white border rounded-3xl p-6 transition-all hover:shadow-lg hover:shadow-slate-200/50 ${
                notification.read ? 'border-admin-border opacity-75' : 'border-admin-accent/30 bg-admin-accent/5'
              }`}
            >
              <div className="flex gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  notification.read ? 'bg-slate-100' : 'bg-white shadow-sm'
                }`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className={`font-bold text-slate-900 truncate ${notification.read ? 'font-medium' : ''}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
                      <Clock size={10} />
                      {notification.createdAt?.toDate ? notification.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs font-bold text-admin-accent hover:underline flex items-center gap-1.5"
                      >
                        <MailOpen size={14} />
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-50">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center bg-white border border-admin-border rounded-[32px]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications yet</h3>
            <p className="text-slate-500">We'll notify you when something important happens.</p>
          </div>
        )}
      </div>
    </div>
  );
}
