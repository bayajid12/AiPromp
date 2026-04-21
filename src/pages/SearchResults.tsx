import { useMemo, useState, useEffect } from 'react';
import { useSearch } from '../App';
import { ImageCard } from '../components/ImageCard';
import { motion } from 'motion/react';
import { Search as SearchIcon, X, Sparkles } from 'lucide-react';
import { db, collection, getDocs, query, orderBy, handleFirestoreError, OperationType, limit } from '../firebase';
import { ImageItem } from '../types';

export default function SearchResults() {
  const { searchQuery, setSearchQuery, clearSearch, categories } = useSearch();
  const [dbImages, setDbImages] = useState<ImageItem[]>([]);

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImageItem));
        setDbImages(images);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'prompts');
        } catch (e) {
          setError(e);
        }
      }
    };

    fetchPrompts();
  }, []);

  const relatedImages = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const queryStr = searchQuery.toLowerCase();
    
    return dbImages.filter(img => {
      const inPrompt = img.prompt.toLowerCase().includes(queryStr);
      const inTags = img.tags.some(tag => tag.toLowerCase().includes(queryStr));
      return inPrompt || inTags;
    });
  }, [searchQuery, dbImages]);

  // Fuzzy search / Suggestions logic
  const suggestions = useMemo(() => {
    if (relatedImages.length > 0 || !searchQuery.trim()) return [];
    
    const queryStr = searchQuery.toLowerCase();
    const allTerms = new Set<string>();
    
    // Collect all tags and category names
    dbImages.forEach(img => img.tags.forEach(tag => allTerms.add(tag)));
    categories.forEach(cat => allTerms.add(cat.name));
    
    // Find terms that partially match or have common words
    const matches = Array.from(allTerms).filter(term => {
      const t = term.toLowerCase();
      return t.includes(queryStr) || queryStr.includes(t) || 
             t.split(' ').some(word => queryStr.includes(word)) ||
             queryStr.split(' ').some(word => t.includes(word));
    });
    
    return matches.slice(0, 5);
  }, [searchQuery, relatedImages, dbImages, categories]);

  // Images related to suggestions
  const suggestedImages = useMemo(() => {
    if (suggestions.length === 0) return [];
    
    return dbImages.filter(img => 
      img.tags.some(tag => 
        suggestions.some(s => tag.toLowerCase() === s.toLowerCase())
      )
    ).slice(0, 8);
  }, [suggestions, dbImages]);

  if (!searchQuery.trim()) {
    return (
      <div className="pt-40 pb-20 px-6 text-center">
        <SearchIcon size={64} className="mx-auto text-black/10 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Start searching</h2>
        <p className="text-black/60 max-w-md mx-auto">
          Enter a keyword, tag, or category to discover related AI prompts and images.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold text-black">Search Results</h1>
              <button 
                onClick={clearSearch}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear search"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-black/60 font-medium">
              Found {relatedImages.length} related images for "{searchQuery}"
            </p>
          </motion.div>

          <div className="relative w-full md:w-96">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search again..."
              className="w-full bg-[#F5F5F5] border-none rounded-2xl py-4 pl-12 pr-6 text-black placeholder-black/40 focus:ring-2 focus:ring-black/5 transition-all outline-none"
            />
          </div>
        </div>

        {relatedImages.length > 0 ? (
          <div className="masonry-grid columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {relatedImages.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">
              <SearchIcon size={48} className="mx-auto text-black/10 mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">No exact matches found</h3>
              <p className="text-black/60 mb-8">Try searching for something else or browse categories.</p>
              
              {suggestions.length > 0 && (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm font-bold text-black/40 uppercase tracking-widest">Did you mean?</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => setSearchQuery(s)}
                        className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold hover:border-black transition-all flex items-center gap-2"
                      >
                        <Sparkles size={14} className="text-amber-500" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {suggestedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-2xl font-bold">Related Suggestions</h2>
                </div>
                <div className="masonry-grid columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                  {suggestedImages.map((image) => (
                    <ImageCard key={`suggested-${image.id}`} image={image} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* You might also like section for successful searches */}
        {relatedImages.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-8">You might also like</h2>
            <div className="masonry-grid columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {dbImages.filter(img => !relatedImages.find(r => r.id === img.id)).slice(0, 4).map((image) => (
                <ImageCard key={`suggested-${image.id}`} image={image} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
