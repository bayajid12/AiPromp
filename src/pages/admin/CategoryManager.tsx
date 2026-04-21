import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  CheckCircle2,
  X,
  Layers,
  Camera,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, addDoc, deleteDoc, doc, updateDoc, handleFirestoreError, OperationType, getDocs, where, query, orderBy, limit } from '../../firebase';
import { compressImage } from '../../lib/imageUtils';

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [dbImages, setDbImages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
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

    const fetchImages = async () => {
      try {
        const qImages = query(collection(db, 'prompts'), limit(100));
        const snapshot = await getDocs(qImages);
        const imgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDbImages(imgs);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'prompts');
        } catch (e) {
          setError(e);
        }
      }
    };

    fetchCategories();
    fetchImages();
  }, []);

  // Calculate dynamic counts
  const categoriesWithCounts = categories.map(cat => {
    const count = dbImages.filter(img => 
      img.tags.some(tag => tag.toLowerCase() === cat.name.toLowerCase())
    ).length;
    return { ...cat, count };
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file);
      setNewImage(compressedDataUrl);
    } catch (error) {
      console.error('Compression failed:', error);
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newImage) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), {
          name: newName.trim(),
          imageUrl: newImage
        });
      } else {
        await addDoc(collection(db, 'categories'), {
          name: newName.trim(),
          imageUrl: newImage,
          count: 0
        });
      }
      resetForm();
    } catch (error) {
      try {
        handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'categories');
      } catch (e) {
        setError(e);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (!window.confirm(`WARNING: Deleting the "${categoryName}" category will also PERMANENTLY delete all image prompts associated with it. Are you sure you want to proceed?`)) return;
    
    setIsSubmitting(true);
    try {
      // 1. Find and delete all prompts associated with this category
      // Prompts store category name in their tags array
      const promptsQuery = query(collection(db, 'prompts'), where('tags', 'array-contains', categoryName));
      const promptsSnapshot = await getDocs(promptsQuery);
      
      const deletePromises = promptsSnapshot.docs.map(promptDoc => deleteDoc(doc(db, 'prompts', promptDoc.id)));
      await Promise.all(deletePromises);

      // 2. Delete the category itself
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
      } catch (e) {
        setError(e);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewImage('');
    setEditingId(null);
    setShowAddModal(false);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Category Manager</h1>
          <p className="text-slate-500 font-medium">Organize and manage the marketplace taxonomy.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-admin-accent text-white rounded-xl text-sm font-bold hover:bg-admin-accent/90 transition-colors"
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-white border border-admin-border p-4 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-slate-50 border border-admin-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoriesWithCounts.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase())).map((category) => (
          <motion.div
            key={category.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-admin-border rounded-3xl overflow-hidden group transition-all"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={category.imageUrl} 
                alt={category.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div className="flex gap-2 w-full">
                  <button 
                    onClick={() => {
                      setEditingId(category.id);
                      setNewName(category.name);
                      setNewImage(category.imageUrl);
                      setShowAddModal(true);
                    }}
                    className="flex-1 bg-white/20 backdrop-blur-md text-white py-2 rounded-xl text-xs font-bold hover:bg-white/30 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id, category.name)}
                    className="p-2 bg-rose-500/20 backdrop-blur-md text-rose-500 rounded-xl hover:bg-rose-500/40 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                  {category.count || 0}
                </span>
              </div>
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Active on Store</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
            <Layers className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-bold">No categories found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white border border-admin-border p-8 rounded-[32px]"
            >
              <div className="w-16 h-16 bg-admin-accent/10 rounded-2xl flex items-center justify-center text-admin-accent mb-6">
                <Layers size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900">
                {editingId ? 'Edit Category' : 'New Category'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category Image</label>
                    <div className="relative aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center group">
                      {newImage ? (
                        <>
                          <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="text-white" size={32} />
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <Camera className="mx-auto text-slate-300 mb-2" size={32} />
                          <p className="text-xs font-bold text-slate-400">Upload Cover</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Name</label>
                    <input 
                      type="text" 
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g., Cyberpunk" 
                      className="w-full bg-slate-50 border border-admin-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-admin-accent transition-colors" 
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-4 bg-slate-50 border border-admin-border rounded-2xl font-bold hover:bg-slate-100 transition-colors text-slate-900"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !newName.trim() || !newImage}
                    className="flex-1 px-6 py-4 bg-admin-accent text-white rounded-2xl font-bold hover:bg-admin-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
