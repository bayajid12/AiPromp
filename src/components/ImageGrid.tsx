import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageCard } from './ImageCard';
import { images as initialImages, categories as initialCategories } from '../data';
import { ImageItem } from '../types';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearch } from '../App';
import { db, collection, onSnapshot, query, orderBy, limit, getDocs, handleFirestoreError, OperationType } from '../firebase';

export default function ImageGrid() {
  const { searchQuery, selectedCategory, categories } = useSearch();
  const [dbImages, setDbImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImageItem));
        setDbImages(images);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'prompts');
        } catch (e) {
          setError(e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  // Calculate dynamic counts for categories
  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => {
      const count = dbImages.filter(img => 
        img.tags.some(tag => tag.toLowerCase() === cat.name.toLowerCase())
      ).length;
      return { ...cat, count };
    });
  }, [dbImages, categories]);

  const allImages = useMemo(() => {
    return dbImages;
  }, [dbImages]);

  const allCategories = useMemo(() => {
    return categoriesWithCounts;
  }, [categoriesWithCounts]);

  // Filter images based on search query and selected category
  const filteredImages = useMemo(() => {
    let result = allImages;
    
    if (searchQuery.trim()) {
      const queryStr = searchQuery.toLowerCase();
      result = result.filter((img) => 
        img.prompt.toLowerCase().includes(queryStr) ||
        img.tags.some(tag => tag.toLowerCase().includes(queryStr))
      );
    }

    if (selectedCategory) {
      result = result.filter((img) => 
        img.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase())
      );
    }
    
    return result;
  }, [allImages, searchQuery, selectedCategory]);

  const [displayImages, setDisplayImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    setDisplayImages(filteredImages);
  }, [filteredImages]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="latest-prompts" className="py-12 px-6 max-w-[2560px] mx-auto">
      {/* Header Section from Image */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Prompts</h2>
        </div>
        
        {/* Integrated Categories Carousel */}
        <div className="relative group">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-100 rounded-full shadow-sm hidden md:flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-300 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 no-scrollbar items-center scroll-smooth"
          >
            {allCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => navigate(`/category/${category.name.toLowerCase()}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-shrink-0 flex items-center gap-3 pl-1.5 pr-5 py-1.5 border rounded-full transition-all ${
                  selectedCategory === category.name 
                    ? 'bg-black border-black text-white' 
                    : 'bg-white border-gray-100 hover:bg-gray-100 text-black'
                }`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{category.name}</span>
                  <span className={`text-xs font-medium ${selectedCategory === category.name ? 'text-white/60' : 'text-black/40'}`}>
                    {category.count}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-100 rounded-full shadow-sm hidden md:flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-300 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {displayImages.length > 0 ? (
        <div className="masonry-grid columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6">
          {displayImages.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <h3 className="text-2xl font-bold text-black mb-2">No results found</h3>
          <p className="text-black/60">Try adjusting your search or filters</p>
        </div>
      )}
    </section>
  );
}
