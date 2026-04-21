import { motion } from 'motion/react';

export default function Privacy() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-black">Privacy Policy</h1>
          <p className="text-black text-lg leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect your data.
          </p>
        </motion.div>

        <div className="space-y-12 text-black">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. Data Collection</h2>
            <p>We collect information you provide directly to us, such as when you create an account or use our services.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. Use of Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. Data Security</h2>
            <p>We take reasonable measures to protect your information from loss, theft, and unauthorized access.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
