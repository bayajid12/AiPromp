import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, collection, getDocs, query, orderBy, where, handleFirestoreError, OperationType, limit } from '../firebase';
import { ImageCard } from '../components/ImageCard';
import { ArrowLeft, Search } from 'lucide-react';
import { ImageItem } from '../types';

export default function CategoryDetail() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [dbImages, setDbImages] = useState<ImageItem[]>([]);
  const navigate = useNavigate();

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    if (!categoryName) return;
    
    const fetchPrompts = async () => {
      try {
        // Try to match the category name exactly as it appears in tags
        // Most tags are capitalized (e.g., "Office", "Nature")
        const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        
        const q = query(
          collection(db, 'prompts'), 
          where('tags', 'array-contains', formattedCategory),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        
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
  }, [categoryName]);

  const categoryImages = useMemo(() => {
    let result = dbImages.filter(img => 
      img.tags.some(tag => tag.toLowerCase() === categoryName?.toLowerCase())
    );

    if (searchQuery.trim()) {
      const queryStr = searchQuery.toLowerCase();
      result = result.filter(img => 
        img.prompt.toLowerCase().includes(queryStr) ||
        img.tags.some(tag => tag.toLowerCase().includes(queryStr))
      );
    }

    return result;
  }, [categoryName, searchQuery, dbImages]);

  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-black font-bold mb-4 hover:opacity-70 transition-opacity"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-black capitalize">{categoryName} Prompts</h1>
              <p className="text-black/60 font-medium">
                Showing {categoryImages.length} results for {categoryName}
              </p>
            </motion.div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${categoryName}...`}
              className="w-full bg-[#F5F5F5] border-none rounded-2xl py-4 pl-12 pr-6 text-black placeholder-black/40 focus:ring-2 focus:ring-black/5 transition-all outline-none"
            />
          </div>
        </div>

        {categoryImages.length > 0 ? (
          <div className="masonry-grid columns-1 sm:columns-2 lg:columns-3 xl:columns-4">
            {categoryImages.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-black text-xl font-medium">No prompts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
