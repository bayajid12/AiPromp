import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-10">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Create Account</h2>
              <p className="text-gray-500">Join the world's largest AI prompt community.</p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 ml-1">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl outline-none transition-all"
                />
              </div>
              <button className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors mt-4">
                Sign Up
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Already have an account? <button className="font-bold text-black hover:underline">Log In</button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
