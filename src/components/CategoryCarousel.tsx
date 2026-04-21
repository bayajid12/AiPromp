import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db, collection, onSnapshot, query, orderBy, handleFirestoreError, OperationType } from '../firebase';
import { useSearch } from '../App';

export default function CategoryCarousel() {
  const { setSearchQuery, categories } = useSearch();

  return (
    <section className="py-8 px-6 max-w-[2560px] mx-auto overflow-hidden">
      <div className="relative group">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth items-center">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSearchQuery(category.name)}
              className="flex-shrink-0 flex items-center gap-3 pl-1.5 pr-5 py-1.5 bg-white border border-gray-100 rounded-full hover:border-gray-200 transition-all group/pill"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-50">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Label & Count */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 tracking-tight">{category.name}</span>
                <span className="text-sm font-bold text-gray-300">{category.count || 0}</span>
              </div>
            </motion.button>
          ))}
          
          {/* Next Button / Chevron Indicator */}
          <div className="flex-shrink-0 ml-2">
            <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-300 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
