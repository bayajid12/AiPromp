import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import React from 'react';

export default function Signup() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 p-8 md:p-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 text-black">Create account</h1>
          <p className="text-black/60">Join our community of AI creators</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white border border-gray-200 text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>Sign up with Google</span>
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Terms & Privacy</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed text-center">
              By creating an account, you agree to our <Link to="/terms" className="text-black font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-black font-bold hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-black hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
