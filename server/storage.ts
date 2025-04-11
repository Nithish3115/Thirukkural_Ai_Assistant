import { 
  users, 
  thirukkurals, 
  chatMessages, 
  searchHistory,
  type User, 
  type InsertUser,
  type Thirukkural,
  type InsertThirukkural,
  type ChatMessage,
  type InsertChatMessage,
  type SearchHistory,
  type InsertSearchHistory,
  type SearchResult
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Thirukkural operations
  getThirukkurals(limit: number, offset: number): Promise<Thirukkural[]>;
  getThirukkuralByNumber(number: number): Promise<Thirukkural | undefined>;
  addThirukkural(thirukkural: Thirukkural): Promise<Thirukkural>;
  processSearchResults(results: any[]): Promise<SearchResult[]>;
  
  // Chat operations
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  
  // Search history operations
  addSearchHistory(searchHistory: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistory(sessionId: string): Promise<SearchHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private thirukkurals: Map<number, Thirukkural>;
  private chatMessages: Map<string, ChatMessage[]>;
  private searchHistories: Map<string, SearchHistory[]>;
  
  private userId: number;
  private thirukkuralId: number;
  private chatId: number;
  private searchId: number;

  constructor() {
    this.users = new Map();
    this.thirukkurals = new Map();
    this.chatMessages = new Map();
    this.searchHistories = new Map();
    
    this.userId = 1;
    this.thirukkuralId = 1;
    this.chatId = 1;
    this.searchId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Thirukkural operations
  async getThirukkurals(limit: number, offset: number): Promise<Thirukkural[]> {
    const thirukkurals = Array.from(this.thirukkurals.values());
    thirukkurals.sort((a, b) => a.number - b.number);
    return thirukkurals.slice(offset, offset + limit);
  }
  
  async getThirukkuralByNumber(number: number): Promise<Thirukkural> {
    const kural = this.thirukkurals.get(number);
    if (kural) return kural;
    
    // If Thirukkural not found, create and store a placeholder
    const placeholder = this.createEmptyThirukkural(number);
    this.thirukkurals.set(number, placeholder);
    return placeholder;
  }
  
  // Creates an empty Thirukkural with the given number when the real one is not found
  private createEmptyThirukkural(number: number): Thirukkural {
    return {
      id: -1,
      number,
      chapter: 0,
      chapterName: "Unknown",
      sectionName: "Unknown",
      tamil: "Text not available",
      english: "Text not available",
      tamilExplanation: null,
      englishExplanation: null,
      vector: null
    };
  }
  
  // Add a new Thirukkural to the storage
  async addThirukkural(thirukkural: Thirukkural): Promise<Thirukkural> {
    // If the Thirukkural doesn't have a valid number, assign one
    if (!thirukkural.number || thirukkural.number <= 0) {
      thirukkural.number = this.thirukkuralId++;
    }
    
    // Make sure the Thirukkural has the necessary fields
    const kural: Thirukkural = {
      ...thirukkural,
      chapter: thirukkural.chapter || 0,
      chapterName: thirukkural.chapterName || "Unknown",
      sectionName: thirukkural.sectionName || "Unknown",
      tamilExplanation: thirukkural.tamilExplanation || null,
      englishExplanation: thirukkural.englishExplanation || null,
      vector: thirukkural.vector || null
    };
    
    // Store the Thirukkural by its number for easy lookup
    this.thirukkurals.set(kural.number, kural);
    
    // Update thirukkuralId if necessary
    if (kural.number >= this.thirukkuralId) {
      this.thirukkuralId = kural.number + 1;
    }
    
    return kural;
  }
  
  async processSearchResults(searchResults: any[]): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    if (!Array.isArray(searchResults)) {
      console.error("Search results is not an array:", searchResults);
      return [];
    }
    
    console.log("Processing search results:", JSON.stringify(searchResults));
    
    for (const item of searchResults) {
      try {
        // Handle different number formats
        let thirukkuralNumber: number;
        
        if (typeof item.number === 'number') {
          thirukkuralNumber = item.number;
        } else if (typeof item.number === 'string') {
          thirukkuralNumber = parseInt(item.number, 10);
        } else {
          console.error("Invalid thirukkural number format:", item.number);
          continue;
        }
        
        if (isNaN(thirukkuralNumber) || thirukkuralNumber <= 0) {
          console.error("Invalid thirukkural number value:", thirukkuralNumber);
          continue;
        }
        
        // This now always returns a Thirukkural (real or placeholder)
        const thirukkural = await this.getThirukkuralByNumber(thirukkuralNumber);
        
        // Ensure we have valid score and relevance values
        const score = typeof item.score === 'number' ? item.score : 0;
        let relevance = typeof item.relevance === 'number' ? item.relevance : 0.5;
        
        // Flag random results with lower relevance
        if (item.is_random || item.isRandom) {
          relevance = 0.1;
        }
        
        results.push({
          thirukkural,
          score,
          relevance
        });
      } catch (error) {
        console.error("Error processing search result item:", error, item);
      }
    }
    
    console.log("Final processed results:", JSON.stringify(results.map(r => ({
      number: r.thirukkural.number,
      score: r.score,
      relevance: r.relevance
    }))));
    
    return results;
  }
  
  // Chat operations
  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatId++;
    // Ensure metadata is always defined, even if null
    const chatMessage: ChatMessage = { 
      ...message, 
      id,
      metadata: message.metadata ?? null 
    };
    
    if (!this.chatMessages.has(message.sessionId)) {
      this.chatMessages.set(message.sessionId, []);
    }
    
    this.chatMessages.get(message.sessionId)!.push(chatMessage);
    return chatMessage;
  }
  
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.chatMessages.get(sessionId) || [];
  }
  
  // Search history operations
  async addSearchHistory(search: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.searchId++;
    // Ensure results is always defined, even if null
    const searchHistory: SearchHistory = { 
      ...search, 
      id,
      results: search.results ?? null 
    };
    
    if (!this.searchHistories.has(search.sessionId)) {
      this.searchHistories.set(search.sessionId, []);
    }
    
    this.searchHistories.get(search.sessionId)!.push(searchHistory);
    return searchHistory;
  }
  
  async getSearchHistory(sessionId: string): Promise<SearchHistory[]> {
    return this.searchHistories.get(sessionId) || [];
  }
}

export const storage = new MemStorage();
