import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import React from 'react';

export default function Login() {
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
          <h1 className="text-3xl font-bold mb-3 text-black">Welcome back</h1>
          <p className="text-black/60">Sign in to access your creative studio</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 brightness-0 invert" />
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="mt-10">
          <div className="pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-black hover:underline">Sign up for free</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
