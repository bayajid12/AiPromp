import { motion } from 'motion/react';

export default function Explore() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold mb-6 text-black">Explore the Feed</h1>
        <p className="text-black text-lg max-w-2xl mx-auto">
          Discover the most popular and trending AI-generated images from our global community.
        </p>
      </motion.div>
      
      {/* Placeholder for more complex explore features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center text-black/20 font-bold">
            Trending Collection {i}
          </div>
        ))}
      </div>
    </div>
  );
}
