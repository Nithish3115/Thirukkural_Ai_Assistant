import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { MessageSquare, Send, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  isUser: boolean;
  text: string;
  timestamp: Date;
  references?: {
    verseNumbers?: number[];
    chapterNumbers?: number[];
  };
}

export default function ChatbotSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      isUser: false,
      text: "Hello! I'm your Thirukkural AI assistant. You can ask me anything about the Thirukkural, its philosophy, or how to apply its wisdom to modern life. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendChatMessage } = useStore();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      isUser: true,
      text: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Send to API and get response
      const response = await sendChatMessage(inputMessage);
      
      // Add AI response after a short delay to simulate thinking
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          isUser: false,
          text: response.message,
          timestamp: new Date(),
          references: response.references
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      
      // Add error message
      setMessages(prev => [
        ...prev, 
        {
          id: (Date.now() + 1).toString(),
          isUser: false,
          text: "I'm sorry, I couldn't process your request. Please try again later.",
          timestamp: new Date()
        }
      ]);
    }
  };
  
  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        isUser: false,
        text: "Hello! I'm your Thirukkural AI assistant. You can ask me anything about the Thirukkural, its philosophy, or how to apply its wisdom to modern life. How can I help you today?",
        timestamp: new Date()
      }
    ]);
  };
  
  return (
    <section className="max-w-4xl mx-auto mb-16">
      <motion.div 
        className="glass-dark rounded-3xl p-6 shadow-glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-orbitron font-semibold flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-neon-pink" />
            Thirukkural AI Assistant
          </h2>
          
          <button 
            className="text-sm flex items-center bg-dark-600 hover:bg-dark-700 px-3 py-1.5 rounded-lg transition-all duration-300"
            onClick={clearChat}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Chat
          </button>
        </div>
        
        {/* Chat messages container */}
        <div className="mb-4 space-y-4 max-h-96 overflow-y-auto pr-2">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex items-start ${message.isUser ? 'justify-end' : ''}`}
            >
              {!message.isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-neon-blue flex items-center justify-center mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
              
              <div className={`${
                message.isUser 
                  ? 'bg-primary-500/20 border border-primary-500/40 rounded-2xl rounded-tr-none'
                  : 'bg-white shadow-lg rounded-2xl rounded-tl-none backdrop-blur-sm'
              } p-5 max-w-[85%] ${!message.isUser ? 'border border-gray-300' : ''}`}>
                <div className={`${message.isUser ? 'text-light-100' : 'text-black'} ${message.text.includes('\n') ? 'whitespace-pre-line' : ''} ${message.isUser ? 'prose-sm prose-invert' : 'prose-sm'}`}>
                  {!message.isUser && (
                    <div className="w-full mb-2 pb-2 flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wider font-semibold text-primary-300 bg-primary-500/10 px-2 py-0.5 rounded">AI Assistant</span>
                      <span className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  )}
                  
                  {message.text.split('\n\n').map((paragraph, i) => {
                    // Check if the paragraph appears to be a Thirukkural verse - has quotes or specific patterns
                    const isVerse = paragraph.startsWith('"') || paragraph.includes('--') || /^\d+:/.test(paragraph);
                    
                    // Check if it's a heading - starts with # or has all caps
                    const isHeading = paragraph.startsWith('#') || (paragraph.toUpperCase() === paragraph && paragraph.length > 5);
                    
                    return (
                      <p key={i} className={`
                        ${i > 0 ? 'mt-3' : ''} 
                        ${isVerse 
                          ? 'italic text-neon-blue pl-3 border-l-2 border-neon-blue bg-neon-blue/5 py-2 px-2 rounded' 
                          : ''}
                        ${isHeading && !isVerse
                          ? 'font-bold text-neon-pink'
                          : ''}
                        `}>
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
                
                {/* References if any */}
                {message.references && (
                  <div className="mt-4 space-y-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-700">References</h4>
                    
                    {message.references.verseNumbers?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-blue-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Verses:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {message.references.verseNumbers?.map(num => (
                            <span key={`verse-${num}`} className="text-xs bg-blue-50 border border-blue-300 text-blue-700 px-2 py-0.5 rounded-md hover:bg-blue-100 hover:border-blue-400 cursor-pointer transition-all duration-300">
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {message.references.chapterNumbers?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-primary-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                          </svg>
                          Chapters:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {message.references.chapterNumbers?.map(num => (
                            <span key={`chapter-${num}`} className="text-xs bg-green-50 border border-green-300 text-green-700 px-2 py-0.5 rounded-md hover:bg-green-100 hover:border-green-400 cursor-pointer transition-all duration-300">
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {message.isUser && (
                <div className="w-8 h-8 rounded-full bg-dark-600 border border-primary-500 flex items-center justify-center ml-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
          
          {/* Loading/typing indicator */}
          {isTyping && (
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-neon-blue flex items-center justify-center mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="bg-white shadow-lg rounded-2xl rounded-tl-none p-5 max-w-[85%] border border-gray-300">
                <div className="w-full mb-2 pb-2 flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary-300 bg-primary-500/10 px-2 py-0.5 rounded">AI Assistant</span>
                  <span className="text-xs text-gray-400">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse opacity-75" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse opacity-50" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-xs text-black ml-1">Generating wisdom...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat input */}
        <form onSubmit={handleSendMessage} className="relative">
          <input 
            type="text" 
            placeholder="Ask about Thirukkural philosophy..." 
            className="w-full py-3 pl-4 pr-12 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 text-black"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 hover:bg-primary-600 p-2 rounded-lg transition-all duration-300"
            disabled={isTyping || !inputMessage.trim()}
          >
            <Send className="h-5 w-5 text-white" />
          </button>
        </form>
      </motion.div>
    </section>
  );
}
