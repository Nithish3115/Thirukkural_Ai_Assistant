import { getAudio } from './api';

// Audio context for playing TTS audio
let audioContext: AudioContext | null = null;
let audioSource: AudioBufferSourceNode | null = null;
let audioElement: HTMLAudioElement | null = null;

// Initialize audio context on user interaction
export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Play audio from the TTS service
export async function playAudio(kuralNumber: number, language: 'tamil' | 'english'): Promise<void> {
  try {
    // Initialize audio context if needed
    initAudio();
    
    // Stop any currently playing audio
    stopAudio();
    
    // Get audio data from API
    const response = await getAudio(language, kuralNumber);
    console.log(`Playing ${language} audio for kural ${kuralNumber}: ${response.text}`);
    
    // Check if we have base64 audio data from the server
    if (response.audio_data) {
      // Decode base64 data to binary
      const audioData = atob(response.audio_data);
      
      // Convert binary string to array buffer
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      
      // Use an audio element for playback
      const blob = new Blob([arrayBuffer], { type: response.content_type || 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      
      audioElement = new Audio(url);
      audioElement.onended = () => {
        if (url) URL.revokeObjectURL(url);
      };
      
      const playPromise = audioElement.play();
      
      // Return a promise that resolves when audio is done
      return new Promise((resolve) => {
        audioElement!.onended = () => {
          if (url) URL.revokeObjectURL(url);
          resolve();
        };
        
        // Fallback in case onended doesn't fire
        setTimeout(() => {
          if (url) URL.revokeObjectURL(url);
          resolve();
        }, 15000);
      });
    } else {
      // Fallback to Web Speech API if no audio data
      const utterance = new SpeechSynthesisUtterance(response.text);
      
      // Set the language based on the selected language
      utterance.lang = language === 'tamil' ? 'ta-IN' : 'en-US';
      utterance.rate = 0.9; // Slightly slower for better comprehension
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
      
      // Return a promise that resolves when speech is done
      return new Promise((resolve) => {
        utterance.onend = () => resolve();
        
        // Fallback in case onend doesn't fire
        setTimeout(resolve, 15000);
      });
    }
  } catch (error) {
    console.error('Error playing audio:', error);
    
    // Attempt to play using Web Speech API as fallback
    try {
      const text = `Unable to fetch audio from server. This is a fallback message for kural number ${kuralNumber}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'tamil' ? 'ta-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (fallbackError) {
      console.error('Fallback speech synthesis failed:', fallbackError);
    }
    
    throw error;
  }
}

// Stop currently playing audio
export function stopAudio() {
  // Stop Web Speech API if active
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  
  // Stop HTML audio element if active
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
    audioElement = null;
  }
  
  // Stop AudioContext source if active
  if (audioSource) {
    try {
      audioSource.stop();
    } catch (e) {
      // Source might have already stopped
    }
    audioSource = null;
  }
}
