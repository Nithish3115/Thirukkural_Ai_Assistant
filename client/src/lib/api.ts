import { apiRequest } from './queryClient';
import { SearchResult, AIResponse, Thirukkural } from '@shared/schema';

// Function to search Thirukkurals using FAISS vector search
export async function searchThirukkural(query: string, limit = 5): Promise<SearchResult[]> {
  try {
    const response = await apiRequest('POST', '/api/search', { query, limit });
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching Thirukkurals:', error);
    throw error;
  }
}

// Function to get a specific Thirukkural by number
export async function getThirukkuralByNumber(number: number): Promise<Thirukkural> {
  try {
    const response = await apiRequest('GET', `/api/thirukkural/${number}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Thirukkural:', error);
    throw error;
  }
}

// Function to get audio for a Thirukkural
export async function getAudio(language: 'tamil' | 'english', number: number): Promise<{ text: string, audio_data?: string, content_type?: string }> {
  try {
    const response = await apiRequest('GET', `/api/audio/${language}/${number}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting audio:', error);
    throw error;
  }
}

// Function to send a chat message and get AI response
export async function getChatResponse(message: string, sessionId?: string): Promise<AIResponse> {
  try {
    const response = await apiRequest('POST', '/api/chat', { message, sessionId });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

// Function to get chat history
export async function getChatHistory(sessionId: string) {
  try {
    const response = await apiRequest('GET', `/api/chat/${sessionId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}
