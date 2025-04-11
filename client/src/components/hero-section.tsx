import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { X, Heart, BookOpen, MessageCircle, Globe2, Headphones, Lightbulb, Github, Linkedin, ArrowRight, Code } from 'lucide-react';

export default function HeroSection() {
  const { scrollToSearch } = useStore();
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  return (
    <>
      <section className="mb-16 relative">
        <motion.div 
          className="glass rounded-3xl p-8 md:p-12 max-w-4xl mx-auto relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-600/30 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-neon-blue/20 rounded-full filter blur-3xl"></div>
          
          <div className="relative">
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-orbitron mb-4 font-bold tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="gradient-text">திருக்குறள் AI</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-light-200 mb-8 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Experience the ancient wisdom of Thirukkural reimagined with modern AI technology. Discover relevant verses for your questions and explore the timeless philosophy.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <button 
                className="bg-gradient-to-r from-primary-500 to-primary-700 text-white px-8 py-3 rounded-full font-medium hover:shadow-neon-purple transition-all duration-300 flex items-center"
                onClick={scrollToSearch}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Start Exploring
              </button>
              
              <button 
                className="bg-dark-600 border border-primary-500/50 text-white px-8 py-3 rounded-full font-medium hover:border-primary-500 hover:bg-dark-700 transition-all duration-300 flex items-center"
                onClick={() => setShowLearnMore(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Learn More
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>
      
      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-800 max-w-4xl w-full rounded-xl overflow-hidden relative">
            <button 
              className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-dark-700/50 transition-colors"
              onClick={() => setShowLearnMore(false)}
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="px-6 py-4 border-b border-dark-700">
              <h2 className="text-2xl gradient-text font-bold">About Thirukkural AI</h2>
            </div>
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-8">
                {/* About the project */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary-400">Bridging Ancient Wisdom with Modern Life</h3>
                  <p className="text-light-100 mb-3">
                    Thirukkural AI brings the timeless wisdom of Thirukkural—a 2000-year-old Tamil classic—into the digital age, making these profound teachings accessible and relevant to modern life challenges. Written by the poet-saint Thiruvalluvar, these 1330 short couplets contain universal insights on ethics, politics, economics, love, and spirituality that remain remarkably applicable today.
                  </p>
                  <p className="text-light-100 mb-3">
                    Our platform uses cutting-edge AI to help you discover verses that provide guidance for contemporary challenges—from maintaining healthy relationships and managing emotions to ethical decision-making and leadership principles.
                  </p>
                </div>
                
                {/* Impact on Modern Life */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary-400">Impact on Modern Society</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                      <div className="flex items-center mb-2">
                        <Heart className="h-5 w-5 text-neon-pink mr-2" />
                        <h4 className="font-medium">Personal Growth</h4>
                      </div>
                      <p className="text-sm text-light-200">
                        Access ancient wisdom tailored to your personal challenges, helping with emotional regulation, relationship management, and ethical decision-making in today's complex world.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                      <div className="flex items-center mb-2">
                        <BookOpen className="h-5 w-5 text-neon-blue mr-2" />
                        <h4 className="font-medium">Educational Value</h4>
                      </div>
                      <p className="text-sm text-light-200">
                        Provides an engaging, interactive way for students and educators to explore Tamil literature and philosophy, making classical wisdom accessible to the digital generation.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                      <div className="flex items-center mb-2">
                        <MessageCircle className="h-5 w-5 text-primary-400 mr-2" />
                        <h4 className="font-medium">Cross-Cultural Connection</h4>
                      </div>
                      <p className="text-sm text-light-200">
                        Bridges cultural divides by demonstrating how ancient Tamil wisdom resonates with universal human experiences, fostering greater understanding across cultures and generations.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                      <div className="flex items-center mb-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                        <h4 className="font-medium">Ethical Framework</h4>
                      </div>
                      <p className="text-sm text-light-200">
                        Offers timeless ethical principles that provide guidance in navigating today's moral complexities in business, politics, and social interactions.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Features */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary-400">Key Features</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <div className="mt-1 mr-3 text-primary-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-light-100">Semantic Search</h4>
                        <p className="text-sm text-light-300">Ask questions in natural language and find the most relevant Thirukkural verses that address your concerns.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mt-1 mr-3 text-neon-blue">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-light-100">Interactive Visualizations</h4>
                        <p className="text-sm text-light-300">Explore connections between related verses and concepts through intuitive network visualizations.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mt-1 mr-3 text-neon-pink">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-light-100">AI Chat Assistant</h4>
                        <p className="text-sm text-light-300">Engage in philosophical discussions with an AI assistant that contextualizes Thirukkural wisdom for modern situations.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mt-1 mr-3 text-green-400">
                        <Globe2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-light-100">Bilingual Support</h4>
                        <p className="text-sm text-light-300">Experience content in both Tamil and English, making it accessible to a wider audience.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mt-1 mr-3 text-yellow-500">
                        <Headphones className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-light-100">Text-to-Speech</h4>
                        <p className="text-sm text-light-300">Listen to verses in their original Tamil pronunciation or English translation.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Connect with the developer */}
                <div className="p-5 rounded-lg bg-dark-700/50 border border-dark-600">
                  <h3 className="text-xl font-semibold mb-3 text-primary-400">Connect with the Developer</h3>
                  <p className="text-light-200 mb-4">
                    I'm passionate about combining ancient wisdom with modern technology to create meaningful experiences. Feel free to connect with me on:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href="https://github.com/Nithish3115" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-dark-900 rounded-lg hover:bg-dark-800 transition-colors"
                    >
                      <Github className="h-5 w-5 mr-2" />
                      <span>GitHub</span>
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/nithish-s-53a9a5292/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-dark-900 rounded-lg hover:bg-dark-800 transition-colors"
                    >
                      <Linkedin className="h-5 w-5 mr-2" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </div>
                
                {/* Technical Details button */}
                <div className="flex justify-center space-x-4">
                  <button 
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full text-white font-medium hover:shadow-neon-purple transition-all duration-300 flex items-center"
                    onClick={() => {
                      setShowLearnMore(false);
                      setShowTechnicalDetails(true);
                    }}
                  >
                    <Code className="h-5 w-5 mr-2" />
                    Technical Details
                  </button>
                  
                  <button 
                    className="px-6 py-3 bg-dark-700 rounded-full text-white font-medium hover:bg-dark-600 transition-all duration-300"
                    onClick={() => setShowLearnMore(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Technical Details Modal */}
      {showTechnicalDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-800 max-w-4xl w-full rounded-xl overflow-hidden relative">
            <button 
              className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-dark-700/50 transition-colors"
              onClick={() => setShowTechnicalDetails(false)}
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="px-6 py-4 border-b border-dark-700">
              <h2 className="text-2xl gradient-text font-bold">Technical Details</h2>
            </div>
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-8">
                {/* Technology Stack */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary-400">Technology Stack</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-800/50 p-4 rounded-lg flex items-start">
                      <div className="mr-3 text-primary-400">
                        <Code className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Frontend</h4>
                        <p className="text-light-200 text-sm">React, TypeScript, Tailwind CSS, Framer Motion, D3.js</p>
                      </div>
                    </div>
                    
                    <div className="bg-dark-800/50 p-4 rounded-lg flex items-start">
                      <div className="mr-3 text-primary-400">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Backend</h4>
                        <p className="text-light-200 text-sm">Node.js, Express, TypeScript</p>
                      </div>
                    </div>
                    
                    <div className="bg-dark-800/50 p-4 rounded-lg flex items-start">
                      <div className="mr-3 text-primary-400">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z M9 17v-6 M12 17v-2 M15 17v-4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Data Processing</h4>
                        <p className="text-light-200 text-sm">Python, FAISS, NumPy, Pandas</p>
                      </div>
                    </div>
                    
                    <div className="bg-dark-800/50 p-4 rounded-lg flex items-start">
                      <div className="mr-3 text-primary-400">
                        <Lightbulb className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">AI & ML</h4>
                        <p className="text-light-200 text-sm">OpenAI, Vector Embeddings, FAISS</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Download and Run Instructions */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary-400">How to Download and Run Locally</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Github className="h-5 w-5 mr-2" />
                        Step 1: Clone the Repository
                      </h4>
                      <div className="bg-dark-900 p-3 rounded-md text-sm font-mono overflow-x-auto">
                        <code>git clone https://github.com/Nithish3115/Thirukkural_Ai_Assistant.git</code>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
                        </svg>
                        Step 2: Install Dependencies
                      </h4>
                      <div className="bg-dark-900 p-3 rounded-md text-sm font-mono overflow-x-auto">
                        <code>cd thirukkural-ai<br />npm install</code>
                      </div>
                      <p className="mt-2 text-sm text-light-300">This will install all required frontend and backend dependencies.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Step 3: Install Python Dependencies
                      </h4>
                      <div className="bg-dark-900 p-3 rounded-md text-sm font-mono overflow-x-auto">
                        <code>pip install pandas numpy faiss-cpu gtts</code>
                      </div>
                      <p className="mt-2 text-sm text-light-300">These Python packages are required for data processing and text-to-speech functionality.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Step 4: Start the Application
                      </h4>
                      <div className="bg-dark-900 p-3 rounded-md text-sm font-mono overflow-x-auto">
                        <code>npm run dev</code>
                      </div>
                      <p className="mt-2 text-sm text-light-300">This will start both the backend server and frontend development server.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Step 5: Access the Application</h4>
                      <p className="text-light-300">
                        Open your browser and navigate to <span className="text-primary-400 font-mono">http://localhost:5000</span> to view the application.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* OpenAI API Key Note */}
                <div className="p-4 border border-yellow-600/30 rounded-lg bg-yellow-950/20">
                  <h4 className="text-yellow-500 font-medium mb-2">Important Note</h4>
                  <p className="text-light-200 text-sm">
                    To use the AI-powered chat functionality, you will need to set up an OpenAI API key. Create a <span className="font-mono text-xs">.env</span> file in the root directory and add your API key:
                  </p>
                  <div className="bg-dark-900 p-3 rounded-md mt-2 text-sm font-mono overflow-x-auto">
                    <code>OPENAI_API_KEY=your_api_key_here</code>
                  </div>
                </div>
                
                {/* Required System Specifications */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary-400">System Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1 text-light-100">
                    <li>Node.js v16+</li>
                    <li>Python 3.7+</li>
                    <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                    <li>4GB RAM minimum (8GB recommended)</li>
                    <li>Internet connection for AI and TTS features</li>
                  </ul>
                </div>
                
                {/* Close button */}
                <div className="flex justify-center mt-8">
                  <button 
                    className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full text-white font-medium hover:shadow-neon-purple transition-all duration-300"
                    onClick={() => setShowTechnicalDetails(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
