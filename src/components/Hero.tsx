import { Search, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../App';
import { db, collection, onSnapshot, query, orderBy, limit, handleFirestoreError, OperationType } from '../firebase';

export default function Hero() {
  const { searchQuery, setSearchQuery, categories } = useSearch();
  const [trendingTags, setTrendingTags] = useState<string[]>(['Cinematic', 'Architecture', 'Portrait', 'Fantasy', 'Cyberpunk']);
  const navigate = useNavigate();

  useEffect(() => {
    if (categories.length > 0) {
      const tags = categories.slice(0, 7).map(cat => cat.name);
      setTrendingTags(Array.from(new Set(tags)));
    }
  }, [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search');
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    navigate('/search');
  };

  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-16 px-6 max-w-[2560px] mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4 md:mb-6 text-black">
          Discover & Generate <br />
          Stunning AI Images.
        </h1>
        <p className="text-base md:text-lg text-black mb-8 md:mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Explore millions of AI-generated prompts, remix ideas, and build your creative workflow.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto mb-6 md:mb-8">
          <form onSubmit={handleSearch} className="flex items-center bg-[#F0F0F0] rounded-xl p-1.5 md:p-2 pl-4 md:pl-6">
            <ImageIcon className="text-black/40 mr-2 md:mr-4 hidden sm:block" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-black placeholder-black/40 py-2 md:py-3 outline-none text-sm md:text-base"
            />
            <button 
              type="submit"
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm md:text-base"
            >
              <Search size={18} />
              <span className="hidden xs:inline">Explore</span>
            </button>
          </form>
        </div>

        {/* Trending Tags */}
        <div className="flex flex-wrap justify-center items-center gap-1.5 md:gap-2">
          <span className="text-xs md:text-sm font-medium text-black/40 mr-1 md:mr-2">Trending:</span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg text-[10px] md:text-sm font-medium transition-all ${
                searchQuery === tag 
                  ? 'bg-gray-200 text-black' 
                  : 'bg-[#F5F5F5] text-black hover:bg-gray-100'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
