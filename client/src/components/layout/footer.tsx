import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="glass-dark border-t border-white/10 py-6 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div 
            className="mb-4 md:mb-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-neon-blue flex items-center justify-center">
                <span className="text-white font-bold text-sm">த்</span>
              </div>
              <span className="text-lg font-orbitron font-semibold gradient-text">திருக்குறள் AI</span>
            </div>
            <p className="text-sm text-light-300 mt-2">Bringing ancient wisdom to modern life with AI</p>
          </motion.div>
          
          <motion.div 
            className="flex space-x-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a href="#" className="text-light-300 hover:text-primary-500 transition-colors duration-300">
              <span className="sr-only">About</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>
            <a href="#" className="text-light-300 hover:text-primary-500 transition-colors duration-300">
              <span className="sr-only">GitHub</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </a>
            <a href="#" className="text-light-300 hover:text-primary-500 transition-colors duration-300">
              <span className="sr-only">Settings</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-6 pt-6 border-t border-gray-700/50 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-xs text-light-300 mb-4 md:mb-0">
            &copy; 2025 திருக்குறள் AI • Thirukkural text in public domain • Powered by FAISS vector search
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-xs text-light-300 hover:text-primary-500 transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="text-xs text-light-300 hover:text-primary-500 transition-colors duration-300">Terms of Service</a>
            <a href="#" className="text-xs text-light-300 hover:text-primary-500 transition-colors duration-300">Contact</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
