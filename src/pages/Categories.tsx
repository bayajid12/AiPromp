import { motion } from 'motion/react';
import { useSearch } from '../App';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { db, collection, onSnapshot, query, orderBy, getDocs, handleFirestoreError, OperationType, limit } from '../firebase';

export default function Categories() {
  const { setSelectedCategory, categories } = useSearch();
  const navigate = useNavigate();
  const [dbImages, setDbImages] = useState<any[]>([]);

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const qImages = query(collection(db, 'prompts'), limit(50));
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

    fetchImages();
  }, []);

  // Calculate dynamic counts
  const categoriesWithCounts = categories.map(cat => {
    const count = dbImages.filter(img => 
      img.tags.some(tag => tag.toLowerCase() === cat.name.toLowerCase())
    ).length;
    return { ...cat, count };
  });

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/category/${categoryName.toLowerCase()}`);
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold mb-6 text-black">Browse Categories</h1>
        <p className="text-black text-lg max-w-2xl mx-auto">
          Explore our curated collections of AI prompts across various styles and themes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {categoriesWithCounts.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleCategoryClick(category.name)}
            className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-lg shadow-black/5"
          >
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <h3 className="text-white text-2xl font-bold mb-1">{category.name}</h3>
              <p className="text-white/60 text-sm font-medium">{category.count || 0} Prompts</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-black/40 font-medium">No categories found. Add some from the admin panel!</p>
        </div>
      )}
    </div>
  );
}
