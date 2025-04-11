import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HeroSection from '@/components/hero-section';
import SearchSection from '@/components/search-section';
import ResultsSection from '@/components/results-section';
import ChatbotSection from '@/components/chatbot-section';
import VerseConnectionMapper from '@/components/verse-connection-mapper';
import { useStore } from '@/lib/store';

export default function Home() {
  const { searchResults, selectedKural } = useStore();
  
  return (
    <div className="min-h-screen flex flex-col bg-dark-800 text-light-100 font-inter antialiased relative overflow-x-hidden">
      {/* Futuristic gradient background */}
      <div className="fixed inset-0 bg-gradient-radial from-dark-700 to-dark-800 -z-10"></div>
      
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-primary-500/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-neon-blue/5 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-neon-pink/5 rounded-full filter blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10 flex-grow">
        <HeroSection />
        <SearchSection />
        {searchResults.length > 0 && <ResultsSection />}
        {selectedKural && searchResults.length > 0 && <VerseConnectionMapper />}
        <ChatbotSection />
      </main>
      
      <Footer />
    </div>
  );
}
