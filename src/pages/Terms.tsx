import { motion } from 'motion/react';

export default function Terms() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-black">Terms of Service</h1>
          <p className="text-black text-lg leading-relaxed">
            By using AiPromp, you agree to the following terms and conditions.
          </p>
        </motion.div>

        <div className="space-y-12 text-black">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. Acceptance of Terms</h2>
            <p>By accessing our website, you agree to be bound by these terms of service and all applicable laws and regulations.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials on AiPromp's website for personal, non-commercial transitory viewing only.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. Disclaimer</h2>
            <p>The materials on AiPromp's website are provided on an 'as is' basis. AiPromp makes no warranties, expressed or implied.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
