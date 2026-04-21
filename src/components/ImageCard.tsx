import React, { useState, MouseEvent } from 'react';
import { Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ImageItem } from '../types';
import { useSearch } from '../App';
import { db, doc, updateDoc, increment } from '../firebase';

interface ImageCardProps {
  image: ImageItem;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { 
    setSelectedImage, 
    user, 
    publicCopyCount, 
    publicViewCount, 
    incrementPublicCopy, 
    incrementPublicView 
  } = useSearch();

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

  const copyPrompt = (e: MouseEvent) => {
    e.stopPropagation();
    
    if (!user && publicCopyCount >= 4) {
      navigate('/login');
      return;
    }

    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    trackAction('copies');
    if (!user) incrementPublicCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    if (!user && publicViewCount >= 10) { // Let's say 10 views limit for details
      navigate('/login');
      return;
    }
    
    setSelectedImage(image);
    trackAction('views');
    if (!user) incrementPublicView();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onClick={handleOpen}
      className="masonry-item group relative cursor-zoom-in"
    >
      <div className="relative overflow-hidden rounded-xl bg-gray-100">
        <img
          src={image.url}
          alt={image.prompt}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          style={{ minHeight: '200px' }}
        />

        {/* Mobile Copy Button - Visible only on mobile */}
        <button
          onClick={copyPrompt}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-black md:hidden shadow-sm active:scale-90 transition-transform"
        >
          {copied ? (
            <span className="text-[10px] font-bold px-1">Copied!</span>
          ) : (
            <Copy size={16} />
          )}
        </button>

        {/* Overlay - Hidden on mobile, visible on hover for desktop */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col justify-end p-6">
          <div className="space-y-4">
            {/* Prompt Text */}
            <div className="space-y-2">
              <p className="text-white text-sm font-medium leading-snug line-clamp-2">
                {image.prompt}
              </p>
              <div className="flex flex-nowrap overflow-hidden gap-2">
                {image.tags.map((tag, idx) => (
                  <span key={`${tag}-${idx}`} className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-white/60 bg-white/10 px-2 py-0.5 rounded-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={copyPrompt}
              className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              {copied ? (
                <span>Copied!</span>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
    </motion.div>
  );
}
