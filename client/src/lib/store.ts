import { create } from 'zustand';
import { searchThirukkural as apiSearchThirukkural, getChatResponse } from './api';
import { Thirukkural, SearchResult, AIResponse } from '@shared/schema';

interface ThirukkuralStore {
  // Language settings
  currentLanguage: 'tamil' | 'english';
  toggleLanguage: () => void;
  
  // Search functionality
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  searchResults: SearchResult[];
  searchProcessStep: number;
  showSearchProcess: boolean;
  searchThirukkural: (query: string) => Promise<void>;
  
  // Selected Kural
  selectedKural: Thirukkural | null;
  selectKural: (kural: Thirukkural) => void;
  
  // Chat functionality
  sendChatMessage: (message: string) => Promise<AIResponse>;
  
  // UI state
  scrollToSearch: () => void;
}

export const useStore = create<ThirukkuralStore>((set, get) => ({
  // Language settings
  currentLanguage: 'tamil',
  toggleLanguage: () => set(state => ({ 
    currentLanguage: state.currentLanguage === 'tamil' ? 'english' : 'tamil' 
  })),
  
  // Search functionality
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSearching: false,
  searchResults: [],
  searchProcessStep: 0,
  showSearchProcess: true,
  
  searchThirukkural: async (query) => {
    set({ 
      isSearching: true, 
      searchProcessStep: 1,
      searchResults: []
    });
    
    // Simulate step progression for UX
    const progressSearch = async () => {
      if (!get().showSearchProcess) {
        set({ searchProcessStep: 4 });
        return;
      }
      
      // Step 1: Analyzing query - already set
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ searchProcessStep: 2 });
      
      // Step 2: Finding relevant verses
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ searchProcessStep: 3 });
      
      // Step 3: Ranking results
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ searchProcessStep: 4 });
      
      // Step 4: Generating insights is done when results are displayed
    };
    
    try {
      // Start the progress animation
      progressSearch();
      
      // Actual API call
      const results = await apiSearchThirukkural(query);
      
      // After results are back
      set({ 
        searchResults: results,
        isSearching: false,
        selectedKural: results.length > 0 ? results[0].thirukkural : null
      });
      
    } catch (error) {
      console.error("Search error:", error);
      set({ 
        isSearching: false,
        searchProcessStep: 0
      });
    }
  },
  
  // Selected Kural
  selectedKural: null,
  selectKural: (kural) => set({ selectedKural: kural }),
  
  // Chat functionality
  sendChatMessage: async (message) => {
    try {
      const response = await getChatResponse(message);
      return response;
    } catch (error) {
      console.error("Chat error:", error);
      return {
        message: "I'm sorry, I couldn't process your request. Please try again later."
      };
    }
  },
  
  // UI state
  scrollToSearch: () => {
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}));
