import { motion } from 'motion/react';

export default function About() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-black">About AiPromp</h1>
          <p className="text-black text-lg leading-relaxed">
            AiPromp is the world's leading platform for AI prompt discovery, sharing, and creative inspiration. 
            We believe that the future of creativity is collaborative, and AI is the ultimate tool to unlock human potential.
          </p>
        </motion.div>

        <div className="space-y-16">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-black">Our Mission</h2>
              <p className="text-black leading-relaxed">
                Our mission is to democratize AI creativity by providing a platform where anyone can find, 
                understand, and use high-quality prompts to generate stunning visuals.
              </p>
            </div>
            <div className="aspect-video bg-gray-100 rounded-[32px] overflow-hidden">
              <img src="https://picsum.photos/seed/mission/800/600" alt="Mission" className="w-full h-full object-cover" />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="aspect-video bg-gray-100 rounded-[32px] overflow-hidden md:order-last">
              <img src="https://picsum.photos/seed/community/800/600" alt="Community" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-black">Built for Creators</h2>
              <p className="text-black leading-relaxed">
                Whether you're a professional designer, a digital artist, or just starting your AI journey, 
                AiPromp provides the tools and community you need to excel.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
