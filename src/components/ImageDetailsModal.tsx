import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Share2, HelpCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageItem } from '../types';
import { images as allImages } from '../data';
import { db, doc, updateDoc, increment } from '../firebase';
import { useSearch } from '../App';

interface ImageDetailsModalProps {
  image: ImageItem | null;
  onClose: () => void;
}

export default function ImageDetailsModal({ image, onClose }: ImageDetailsModalProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { user, publicCopyCount, incrementPublicCopy } = useSearch();

  if (!image) return null;

  const trackAction = async (action: 'views' | 'copies') => {
    if (!image.id || typeof image.id !== 'string' || image.id.startsWith('IMG-')) return;
    try {
      await updateDoc(doc(db, 'prompts', image.id), {
        [action]: increment(1)
      });
    } catch (error) {
      console.error(`Error tracking ${action}:`, error);
    }
  };

  const relatedImages = allImages
    .filter(img => img.id !== image.id && img.tags.some(tag => image.tags.includes(tag)))
    .slice(0, 4);

  const handleCopy = () => {
    if (!user && publicCopyCount >= 4) {
      onClose();
      navigate('/login');
      return;
    }

    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    trackAction('copies');
    if (!user) incrementPublicCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AI Prompt',
        text: image.prompt,
        url: window.location.href,
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-2xl max-h-[95vh] rounded-[24px] overflow-hidden flex flex-col relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div className="overflow-y-auto custom-scrollbar">
            {/* Image Section */}
            <div className="w-full bg-gray-100 relative group">
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-auto min-h-[400px] object-contain bg-black/5"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                  Full Resolution
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 md:p-8 space-y-8">
              {/* Prompt Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-black uppercase tracking-widest">Prompt</h3>
                  <button 
                    onClick={handleCopy}
                    className="text-xs font-bold text-admin-accent hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-700 text-sm font-mono leading-relaxed">
                    {image.prompt}
                  </p>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-black uppercase tracking-widest">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag, idx) => (
                    <span key={`${tag}-${idx}`} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:border-black transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Section */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-[0.98]"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Prompt'}</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-black rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                  >
                    <Share2 size={20} />
                    <span>Share</span>
                  </button>
                </div>

                <button
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  <HelpCircle size={20} />
                  <span>How to use this prompt?</span>
                </button>
              </div>

              {/* Related Images Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-black">Related Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedImages.map(img => (
                    <div 
                      key={img.id} 
                      className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
                    >
                      <img
                        src={img.url}
                        alt="Related"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
