import { motion } from 'motion/react';
import { Users, MessageSquare, Award } from 'lucide-react';

export default function Community() {
  const features = [
    { icon: <Users />, title: 'Connect', description: 'Meet thousands of other prompt engineers.' },
    { icon: <MessageSquare />, title: 'Discuss', description: 'Share tips, tricks, and your latest creations.' },
    { icon: <Award />, title: 'Compete', description: 'Join weekly challenges and win premium credits.' },
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-5xl font-bold mb-6 text-black">Join the Community</h1>
        <p className="text-black text-lg max-w-2xl mx-auto">
          PrompAI is more than just a search engine. It's a place for creators to grow together.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <div key={i} className="p-8 bg-gray-50 rounded-3xl text-center hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-6">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold mb-4 text-black">{f.title}</h3>
            <p className="text-black/60">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
