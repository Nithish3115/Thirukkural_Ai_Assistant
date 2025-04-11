import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';

export default function Header() {
  const { currentLanguage, toggleLanguage } = useStore();
  const [showShadow, setShowShadow] = useState(false);
  
  // Add shadow when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowShadow(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className={`glass-dark border-b border-white/10 py-4 px-6 sticky top-0 z-50 ${
      showShadow ? 'shadow-lg' : ''
    }`}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <motion.div 
          className="flex items-center space-x-3 mb-4 md:mb-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-neon-blue flex items-center justify-center">
            <span className="text-white font-bold text-xl">த்</span>
            <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse"></div>
          </div>
          <h1 className="font-orbitron text-2xl font-bold tracking-wider">
            <span className="gradient-text">திருக்குறள் AI</span>
          </h1>
        </motion.div>

        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Language Toggle Switch */}
          <div className="flex items-center">
            <span className="mr-2 text-sm">EN</span>
            <label htmlFor="language-toggle" className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="language-toggle" 
                className="sr-only peer" 
                checked={currentLanguage === 'tamil'}
                onChange={toggleLanguage}
              />
              <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-500 after:border-neon-blue after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
            <span className="ml-2 text-sm">தமிழ்</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
