import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export default function Pricing() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-5xl font-bold mb-6 text-black">Free for Everyone</h1>
        <p className="text-black text-lg max-w-2xl mx-auto">
          AiPromp is currently free for all users. Explore, copy, and generate prompts without any limits.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto bg-gray-50 rounded-[40px] p-12 text-center border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center text-white mx-auto mb-8">
          <Check size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4">Unlimited Access</h2>
        <p className="text-black/60 mb-10 text-lg">
          No subscriptions, no hidden fees. Just high-quality AI prompts for your creative projects.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-10 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
        >
          Start Exploring Now
        </button>
      </div>
    </div>
  );
}
