import { motion } from 'motion/react';
import { Code, Zap, Shield } from 'lucide-react';

export default function API() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[2560px] mx-auto">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-black">Developer API</h1>
          <p className="text-black text-lg leading-relaxed">
            Integrate the world's most powerful AI prompt database into your own applications. 
            Our API is fast, secure, and built for scale.
          </p>
        </motion.div>

        <div className="space-y-12">
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-black">
              <Code size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-black">Easy Integration</h3>
              <p className="text-black/60">Simple RESTful endpoints that return clean JSON data with full metadata.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-black">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-black">Ultra Fast</h3>
              <p className="text-black/60">Global edge caching ensures sub-100ms response times worldwide.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-black">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-black">Enterprise Security</h3>
              <p className="text-black/60">OAuth2 authentication and granular API key permissions.</p>
            </div>
          </div>
        </div>

        <div className="mt-20 p-8 bg-black text-white rounded-3xl">
          <pre className="font-mono text-sm overflow-x-auto">
            {`GET /api/v1/prompts?q=cyberpunk&limit=10
Authorization: Bearer YOUR_API_KEY`}
          </pre>
        </div>
      </div>
    </div>
  );
}
