import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Copy, 
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, getDocs, query, orderBy, limit, deleteDoc, doc, updateDoc, handleFirestoreError, OperationType } from '../../firebase';

export default function PromptLibrary() {
  const [library, setLibrary] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLibrary(items);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'prompts');
        } catch (e) {
          setError(e);
        }
      }
    };

    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'categories');
        } catch (e) {
          setError(e);
        }
      }
    };

    fetchLibrary();
    fetchCategories();
  }, []);

  const filteredLibrary = library.filter(item => {
    const matchesSearch = item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = categoryFilter === 'All Categories' || 
                           (item.tags && item.tags.includes(categoryFilter));
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'prompts', id));
      setShowDeleteModal(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `prompts/${id}`);
      } catch (e) {
        setError(e);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      const { id, ...data } = editingItem;
      await updateDoc(doc(db, 'prompts', id), data);
      setIsSlideOverOpen(false);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `prompts/${editingItem.id}`);
      } catch (e) {
        setError(e);
      }
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Prompt Library</h1>
          <p className="text-slate-500 font-medium">Manage and organize your entire prompt collection.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-admin-border rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors text-slate-900">
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-admin-accent text-white rounded-xl text-sm font-bold hover:bg-admin-accent/90 transition-colors">
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-admin-card border border-admin-border p-4 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by prompt, ID or tags..."
            className="w-full bg-slate-50 border border-admin-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-admin-border rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none"
          >
            <option>All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-admin-border bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Image</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Prompt Snippet</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tags</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filteredLibrary.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-admin-border">
                      <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium truncate text-slate-900">{item.prompt}</p>
                      <button 
                        onClick={() => copyId(item.id)}
                        className="text-[10px] font-bold text-slate-400 hover:text-admin-accent transition-colors flex items-center gap-1 mt-1"
                      >
                        <Copy size={10} />
                        {item.id}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-admin-accent/10 text-admin-accent rounded-lg text-xs font-bold">
                      {item.tags?.[item.tags.length - 1] || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {item.tags?.slice(0, 2).map((tag: string, idx: number) => (
                        <span key={`${tag}-${idx}`} className="px-2 py-0.5 bg-white border border-admin-border rounded text-[10px] font-medium text-slate-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-bold text-emerald-500">
                        Live
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setIsSlideOverOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setShowDeleteModal(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLibrary.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-500 font-medium">No prompts found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white border border-admin-border p-8 rounded-[32px] border border-admin-border"
            >
              <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900">Delete Prompt?</h3>
              <p className="text-slate-500 mb-8">
                Are you sure you want to delete this prompt? This action cannot be undone and will remove it from the marketplace.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-6 py-4 bg-slate-50 border border-admin-border rounded-2xl font-bold hover:bg-slate-100 transition-colors text-slate-900"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Slide-over */}
      <AnimatePresence>
        {isSlideOverOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSlideOverOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white border-l border-admin-border h-full p-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold text-slate-900">Edit Prompt</h3>
                <button 
                  onClick={() => setIsSlideOverOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {editingItem && (
                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="aspect-video rounded-2xl overflow-hidden border border-admin-border">
                    <img src={editingItem.url} alt="Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prompt Text</label>
                      <textarea 
                        value={editingItem.prompt}
                        onChange={(e) => setEditingItem({ ...editingItem, prompt: e.target.value })}
                        rows={6}
                        className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                        <select 
                          value={editingItem.tags?.[editingItem.tags.length - 1] || ''} 
                          onChange={(e) => {
                            const newTags = [...(editingItem.tags || [])];
                            newTags[newTags.length - 1] = e.target.value;
                            setEditingItem({ ...editingItem, tags: newTags });
                          }}
                          className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 outline-none"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10">
                    <button 
                      type="submit"
                      className="flex-1 bg-admin-accent text-white py-4 rounded-2xl font-bold hover:bg-admin-accent/90 transition-all"
                    >
                      Save Changes
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsSlideOverOpen(false)}
                      className="px-8 bg-slate-50 border border-admin-border text-slate-900 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 right-10 z-[100] bg-rose-500 text-white px-6 py-4 rounded-2xl border border-rose-600 flex items-center gap-3"
          >
            <Trash2 size={20} />
            <span className="font-bold">Prompt Deleted Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
