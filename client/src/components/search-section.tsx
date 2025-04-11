import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Search, ArrowRight } from 'lucide-react';

export default function SearchSection() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { 
    searchQuery, 
    setSearchQuery,
    isSearching, 
    searchThirukkural,
    searchProcessStep,
    showSearchProcess
  } = useStore();
  
  const exampleQueries = [
    "How to choose good friends?",
    "Managing anger effectively",
    "Staying strong during tough times"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchThirukkural(searchQuery);
    }
  };

  const setExampleQuery = (query: string) => {
    setSearchQuery(query);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <section id="search-section" className="max-w-4xl mx-auto mb-16">
      <motion.div 
        className="glass-dark rounded-3xl p-6 md:p-8 shadow-glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-orbitron mb-6 font-semibold flex items-center">
          <Search className="h-6 w-6 mr-2 text-neon-blue" />
          Search Thirukkural Wisdom
        </h2>
        
        <form onSubmit={handleSearch} className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Ask about friendship, patience, anger management..." 
            className="w-full py-3 pl-10 pr-12 bg-dark-600 border border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 hover:bg-primary-600 p-2 rounded-lg transition-all duration-300"
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowRight className="h-5 w-5 text-white" />
            )}
          </button>
        </form>
        
        {/* Example queries */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-light-300">Example queries:</span>
          {exampleQueries.map((query, index) => (
            <button 
              key={index}
              className={`text-sm px-3 py-1 rounded-full bg-dark-600 hover:bg-dark-700 transition-all duration-300 ${
                index === 0 ? 'text-primary-500 border border-primary-500/30' : 
                index === 1 ? 'text-neon-blue border border-neon-blue/30' :
                'text-neon-pink border border-neon-pink/30'
              }`}
              onClick={() => setExampleQuery(query)}
            >
              {query}
            </button>
          ))}
        </div>
        
        {/* Search context visualization */}
        <div className="bg-dark-700/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-light-200">Search process visualization</h3>
            <div className="flex items-center">
              <span className="text-xs text-light-300 mr-1">Show</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={showSearchProcess}
                  onChange={(e) => useStore.setState({ showSearchProcess: e.target.checked })}
                />
                <div className="w-9 h-5 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-500 after:border-neon-blue after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          </div>
          
          <div className="flex items-center mb-3 relative">
            <div className="w-full grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center relative">
                  <div className={`w-6 h-6 rounded-full ${
                    step <= searchProcessStep ? 'bg-primary-500' : 'bg-dark-600'
                  } flex items-center justify-center text-white text-xs z-10`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className="h-1 bg-dark-600 absolute left-6 right-0 top-1/2 -translate-y-1/2">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-neon-blue"
                        style={{ 
                          width: step < searchProcessStep ? '100%' : 
                                step === searchProcessStep ? (step === 1 ? '30%' : step === 2 ? '60%' : '40%') : '0%' 
                        }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Animated ripple for current step */}
                  {isSearching && searchProcessStep === step && (
                    <div className="absolute left-3 top-3 w-6 h-6 rounded-full border-2 border-primary-500 ripple -translate-x-1/2 -translate-y-1/2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-1 text-xs text-light-300">
            <div className={`${searchProcessStep >= 1 ? 'text-primary-500' : 'text-gray-500'} font-medium text-center`}>
              1. Analyzing query
            </div>
            <div className={`${searchProcessStep >= 2 ? 'text-neon-blue' : 'text-gray-500'} font-medium text-center`}>
              2. Finding verses
            </div>
            <div className={`${searchProcessStep >= 3 ? 'text-neon-pink' : 'text-gray-500'} font-medium text-center`}>
              3. Ranking results
            </div>
            <div className={`${searchProcessStep >= 4 ? 'text-primary-500' : 'text-gray-500'} font-medium text-center`}>
              4. Generating insights
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
