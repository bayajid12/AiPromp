import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  Plus, 
  Image as ImageIcon,
  CheckCircle2,
  Save,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, handleFirestoreError, OperationType } from '../../firebase';
import { useSearch } from '../../App';
import { compressImage } from '../../lib/imageUtils';

export default function UploadStudio() {
  const { user, userProfile } = useSearch();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [prompt, setPrompt] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [prevCategory, setPrevCategory] = useState('');

  // New Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryFile, setNewCategoryFile] = useState<File | null>(null);
  const [newCategoryPreview, setNewCategoryPreview] = useState<string | null>(null);

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setCategories(cats);
      if (cats.length > 0 && !category) setCategory(cats[0].name);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      } catch (e) {
        setError(e);
      }
    });
    
    return () => unsubscribe();
  }, [category]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const compressedDataUrl = await compressImage(selectedFile);
        setPreview(compressedDataUrl);
      } catch (error) {
        console.error('Compression failed:', error);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  }, []);

  const onCategoryDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setNewCategoryFile(selectedFile);
      try {
        const compressedDataUrl = await compressImage(selectedFile);
        setNewCategoryPreview(compressedDataUrl);
      } catch (error) {
        console.error('Compression failed:', error);
        const reader = new FileReader();
        reader.onload = (e) => {
          setNewCategoryPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: false
  } as any);

  const { 
    getRootProps: getCategoryRootProps, 
    getInputProps: getCategoryInputProps, 
    isDragActive: isCategoryDragActive 
  } = useDropzone({
    onDrop: onCategoryDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: false
  } as any);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handlePublish = async () => {
    if (!user || !preview || !prompt.trim()) return;
    
    setIsSubmitting(true);
    try {
      const promptData = {
        url: preview, // In a real app, we would upload to Storage and get URL
        prompt: prompt.trim(),
        tags: [...tags, category],
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        height: 1000,
        views: 0,
        copies: 0,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'prompts'), promptData);
      
      setShowToast(true);
      setFile(null);
      setPreview(null);
      setTags([]);
      setTagInput('');
      setPrompt('');
      
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, 'prompts');
      } catch (e) {
        setError(e);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    if (newCategoryName.trim() && newCategoryPreview) {
      setIsCreatingCategory(true);
      try {
        const newCat = {
          name: newCategoryName.trim(),
          imageUrl: newCategoryPreview,
          count: 0
        };
        await addDoc(collection(db, 'categories'), newCat);
        
        setCategory(newCategoryName.trim());
        setShowCategoryModal(false);
        setNewCategoryName('');
        setNewCategoryPreview(null);
        setNewCategoryFile(null);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.CREATE, 'categories');
        } catch (e) {
          setError(e);
        }
      } finally {
        setIsCreatingCategory(false);
      }
    }
  };

  const handleCancelCategory = () => {
    setShowCategoryModal(false);
    setCategory(prevCategory);
    setNewCategoryName('');
    setNewCategoryPreview(null);
    setNewCategoryFile(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Upload Studio</h1>
          <p className="text-slate-500 font-medium">Create and publish new AI assets to the marketplace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Uploader */}
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`relative aspect-square rounded-[32px] border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${
              isDragActive ? 'border-admin-accent bg-admin-accent/5' : 'border-admin-border bg-admin-card hover:border-admin-accent/50'
            }`}
          >
            <input {...getInputProps()} />
            
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                    <Upload className="text-white" size={32} />
                  </div>
                  <p className="text-white font-bold">Change Image</p>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-admin-accent/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="text-admin-accent" size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">Drag & Drop Image</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Support high-resolution PNG, JPG or WEBP formats. Max size 10MB.
                </p>
              </div>
            )}
          </div>

          <div className="bg-admin-card border border-admin-border p-6 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <ImageIcon size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Optimization Active</p>
              <p className="text-xs text-slate-500">Images are automatically compressed for web performance.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="bg-admin-card border border-admin-border p-10 rounded-[32px] space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Main Prompt</label>
              <textarea 
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter the detailed AI prompt here..."
                className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') {
                      setPrevCategory(category);
                      setShowCategoryModal(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 border border-admin-border rounded-2xl px-6 py-4 text-sm text-slate-900 focus:outline-none focus:border-admin-accent transition-colors appearance-none"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                  <option value="ADD_NEW" className="text-admin-accent font-bold">+ Add New Category...</option>
                </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tags</label>
              <div className="min-h-[56px] w-full bg-slate-50 border border-admin-border rounded-2xl px-4 py-2 flex flex-wrap gap-2 items-center">
                {tags.map((tag, idx) => (
                  <span key={`${tag}-${idx}`} className="bg-admin-accent/10 text-admin-accent px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-slate-900 transition-colors">
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "Add tags..." : ""}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 min-w-[100px]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex-1 bg-admin-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-admin-accent/90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  <span>Publish to AiPromp</span>
                </>
              )}
            </button>
            <button className="px-6 bg-white border border-admin-border text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
              <Save size={18} />
              <span className="hidden md:inline">Save as Draft</span>
            </button>
          </div>
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
            <span className="font-bold">Image Uploaded Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelCategory}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white border border-admin-border p-8 rounded-[32px] border border-admin-border"
            >
              <div className="w-16 h-16 bg-admin-accent/10 rounded-2xl flex items-center justify-center text-admin-accent mb-6">
                <Plus size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900">New Category</h3>
              
              <div className="space-y-6 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Cyberpunk" 
                    className="w-full bg-slate-50 border border-admin-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-admin-accent" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Category Image</label>
                  <div 
                    {...getCategoryRootProps()}
                    className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                      isCategoryDragActive ? 'border-admin-accent bg-admin-accent/5' : 'border-admin-border bg-slate-50 hover:border-admin-accent/50'
                    }`}
                  >
                    <input {...getCategoryInputProps()} />
                    {newCategoryPreview ? (
                      <img src={newCategoryPreview} alt="Category Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                        <p className="text-xs font-bold text-slate-500">Upload Cover</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleCancelCategory}
                  disabled={isCreatingCategory}
                  className="flex-1 px-6 py-4 bg-slate-50 border border-admin-border rounded-2xl font-bold hover:bg-slate-100 transition-colors text-slate-900 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || !newCategoryPreview || isCreatingCategory}
                  className="flex-1 px-6 py-4 bg-admin-accent text-white rounded-2xl font-bold hover:bg-admin-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreatingCategory ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
