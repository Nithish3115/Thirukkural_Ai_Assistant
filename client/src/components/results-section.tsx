import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { playAudio } from '@/lib/tts';
import { Volume2, Globe } from 'lucide-react';

export default function ResultsSection() {
  const { 
    searchResults, 
    selectedKural, 
    selectKural,
    currentLanguage,
    toggleLanguage 
  } = useStore();
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Handle audio playback
  const handlePlayAudio = async () => {
    if (!selectedKural) return;
    
    setIsPlayingAudio(true);
    
    try {
      // Simulate audio playback with progress
      const duration = 18; // seconds (mock)
      setAudioDuration(duration);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        setAudioProgress(progress / duration);
        setCurrentTime(progress);
        
        if (progress >= duration) {
          clearInterval(interval);
          setIsPlayingAudio(false);
        }
      }, 1000);
      
      // Call the TTS service
      await playAudio(selectedKural.number, currentLanguage);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlayingAudio(false);
    }
  };
  
  // Format time for audio player
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Ensure we have a selected kural when the component renders
  useEffect(() => {
    if (searchResults.length > 0 && !selectedKural) {
      selectKural(searchResults[0].thirukkural);
    }
  }, [searchResults, selectedKural, selectKural]);
  
  if (!selectedKural) return null;
  
  return (
    <section id="results" className="max-w-5xl mx-auto mb-16">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left sidebar - Search results list */}
        <div className="md:col-span-1">
          <div className="glass-dark rounded-2xl p-5 h-full">
            <h3 className="text-xl font-orbitron mb-4 font-medium">
              Search Results
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-500/20 text-primary-500 border border-primary-500/20">
                {searchResults.length} matches
              </span>
            </h3>
            
            {/* Result items */}
            <div className="space-y-3">
              {searchResults.map((result) => (
                <motion.div 
                  key={result.thirukkural.number}
                  className={`search-result-item p-4 mb-3 cursor-pointer rounded-xl border ${
                    selectedKural.number === result.thirukkural.number 
                      ? 'bg-primary-500/20 border-primary-500/40' 
                      : 'bg-dark-700/50 border-gray-700 hover:bg-dark-700/80'
                  }`}
                  onClick={() => selectKural(result.thirukkural)}
                  whileHover={{ y: -2, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-dark-800/70 text-light-200">
                      Verse {result.thirukkural.number}
                    </div>
                    <div className="text-xs text-light-300">
                      Chapter {result.thirukkural.chapter}
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium text-light-100 mb-2">
                    {result.thirukkural.chapterName}
                  </div>
                  
                  <div className="text-xs text-light-300 mb-2">
                    {currentLanguage === 'tamil' ? (
                      <p className="whitespace-pre-line font-tamil">
                        {result.thirukkural.tamil.replace(/<br\s*\/?>/g, '\n')}
                      </p>
                    ) : (
                      <p>{result.thirukkural.english}</p>
                    )}
                  </div>
                  
                  <div className="relevance-indicator mt-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-light-300">Relevance</span>
                      <span className="text-primary-300">{Math.round(result.relevance * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-neon-blue to-primary-500 rounded-full" 
                        style={{ width: `${Math.round(result.relevance * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content - Selected Thirukkural */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedKural.number}
              className="glass-dark rounded-2xl p-6 h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center">
                    <span className="text-sm bg-primary-500/20 text-primary-500 px-3 py-1 rounded-full">
                      Chapter {selectedKural.chapter}
                    </span>
                    <span className="mx-2 text-light-300">•</span>
                    <span className="text-sm text-light-300">Verse {selectedKural.number}</span>
                  </div>
                  <h2 className="text-2xl font-orbitron mt-2 font-semibold gradient-text">
                    {selectedKural.chapterName} ({currentLanguage === 'tamil' ? 'தமிழ்' : 'English'})
                  </h2>
                </div>
                
                {/* Audio controls */}
                <div className="flex items-center space-x-3">
                  <button 
                    className="p-3 rounded-full bg-dark-600 hover:bg-dark-700 border border-primary-500/30 transition-all duration-300"
                    onClick={toggleLanguage}
                  >
                    <Globe className="h-5 w-5 text-primary-500" />
                  </button>
                  
                  <button 
                    className="p-3 rounded-full bg-dark-600 hover:bg-dark-700 border border-neon-blue/30 transition-all duration-300"
                    onClick={handlePlayAudio}
                    disabled={isPlayingAudio}
                  >
                    <Volume2 className="h-5 w-5 text-neon-blue" />
                  </button>
                </div>
              </div>
              
              {/* Main Thirukkural content */}
              <div className="mb-8">
                {/* Original Tamil verse */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-light-200 mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                    Tamil Original
                  </h3>
                  <blockquote className="bg-dark-600/50 p-5 rounded-xl border-l-4 border-primary-500 text-xl leading-relaxed font-tamil">
                    <p className="whitespace-pre-line">
                      {selectedKural.tamil.replace(/<br\s*\/?>/g, '\n')}
                    </p>
                  </blockquote>
                </div>
                
                {/* English translation */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-light-200 mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-neon-blue mr-2"></span>
                    English Translation
                  </h3>
                  <blockquote className="bg-dark-600/50 p-5 rounded-xl border-l-4 border-neon-blue">
                    {selectedKural.english}
                  </blockquote>
                </div>
                
                {/* Explanation */}
                <div>
                  <h3 className="text-lg font-medium text-light-200 mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-neon-pink mr-2"></span>
                    Explanation
                  </h3>
                  <div className="bg-dark-600/50 p-5 rounded-xl border-l-4 border-neon-pink">
                    <p className="text-light-200 whitespace-pre-line">
                      {currentLanguage === 'tamil' 
                        ? (selectedKural.tamilExplanation?.replace(/<br\s*\/?>/g, '\n') || '')
                        : (selectedKural.englishExplanation?.replace(/<br\s*\/?>/g, '\n') || '')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Audio player (visible when playing) */}
              {isPlayingAudio && (
                <motion.div 
                  className="bg-dark-600 p-4 rounded-xl border border-gray-700 mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button 
                        className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center hover:bg-primary-600 transition-all duration-300"
                        onClick={() => setIsPlayingAudio(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      
                      <div className="text-sm">
                        <div className="text-light-200 font-medium">
                          Playing {currentLanguage === 'tamil' ? 'Tamil' : 'English'} audio
                        </div>
                        <div className="text-light-300 text-xs">AI generated voice</div>
                      </div>
                    </div>
                    
                    <div className="audio-wave flex items-center h-8">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-3"></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="relative w-full h-1 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-neon-blue"
                        style={{ width: `${audioProgress * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-light-300 mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(audioDuration)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* AI assistant advice */}
              <div className="bg-dark-700/70 rounded-xl p-5 border border-gray-700">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-neon-blue flex items-center justify-center mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-light-100 mb-2">AI-Enhanced Insights</h3>
                    <p className="text-light-200 text-sm">
                      This Thirukkural provides wisdom about {selectedKural.chapterName.toLowerCase()} that remains relevant today. Based on your search, consider these modern applications:
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-3 pl-14 mb-4">
                  <li className="text-light-200 text-sm flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>Value the wisdom in the verse that speaks to {selectedKural.chapterName.toLowerCase()}</span>
                  </li>
                  <li className="text-light-200 text-sm flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>Apply these ancient principles to modern situations for better outcomes</span>
                  </li>
                  <li className="text-light-200 text-sm flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>Reflect on how this verse can guide your daily decisions and interactions</span>
                  </li>
                </ul>
                
                <div className="pl-14">
                  <button className="text-sm text-neon-blue hover:text-white hover:bg-neon-blue/20 px-4 py-2 rounded-lg transition-all duration-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Ask a follow-up question
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
