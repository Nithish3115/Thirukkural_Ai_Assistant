import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import path from "path";
import { storage } from "./storage";
import { z } from "zod";
import { runPythonScript } from "./python-bridge";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Endpoint to get a list of Thirukkural verses
  app.get("/api/thirukkurals", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset) || 0;
      const thirukkurals = await storage.getThirukkurals(limit, offset);
      res.json(thirukkurals);
    } catch (error) {
      console.error("Error fetching thirukkurals:", error);
      res.status(500).json({ message: "Failed to fetch thirukkurals" });
    }
  });

  // Endpoint to get a specific Thirukkural by number
  app.get("/api/thirukkural/:number", async (req, res) => {
    try {
      const number = Number(req.params.number);
      if (isNaN(number)) {
        return res.status(400).json({ message: "Invalid thirukkural number" });
      }
      
      const thirukkural = await storage.getThirukkuralByNumber(number);
      if (!thirukkural) {
        return res.status(404).json({ message: "Thirukkural not found" });
      }
      
      res.json(thirukkural);
    } catch (error) {
      console.error("Error fetching thirukkural:", error);
      res.status(500).json({ message: "Failed to fetch thirukkural" });
    }
  });

  // Endpoint to search Thirukkurals using FAISS vector search
  app.post("/api/search", async (req, res) => {
    try {
      const searchSchema = z.object({
        query: z.string().min(1),
        limit: z.number().optional().default(5),
      });
      
      const validatedData = searchSchema.parse(req.body);
      const { query, limit } = validatedData;
      
      // Use Python bridge to perform FAISS search
      let results;
      try {
        results = await runPythonScript("faiss-search.py", [query, String(limit)]);
        console.log("Python search results:", JSON.stringify(results));
        
        // Handle the case where the Python script output includes both debug info and JSON
        if (typeof results === 'string') {
          // Try to extract just the JSON part 
          const jsonMatch = results.match(/\[.*\]/);
          if (jsonMatch) {
            try {
              results = JSON.parse(jsonMatch[0]);
              console.log("Extracted JSON results:", JSON.stringify(results));
            } catch (jsonError) {
              console.error("Failed to parse extracted JSON:", jsonError);
            }
          }
        }
        
        // Check if results is an array or contains an error
        if (!Array.isArray(results)) {
          console.error("Search returned non-array result:", results);
          if (results && (results as any).error) {
            return res.status(500).json({ message: (results as any).error });
          }
          return res.status(500).json({ message: "Invalid search results format" });
        }
      } catch (error) {
        const pythonError = error as Error;
        console.error("Error running Python script:", pythonError);
        return res.status(500).json({ message: `Failed to run search: ${pythonError.message}` });
      }
      
      // Log the search to history
      const sessionId = (req as any).sessionID || "anonymous";
      const timestamp = new Date().toISOString();
      
      // Convert results to the right format and get full thirukkural objects
      const searchResults = await storage.processSearchResults(results);
      
      console.log("Processed search results:", JSON.stringify(searchResults));
      
      await storage.addSearchHistory({
        sessionId,
        query,
        results: searchResults,
        timestamp
      });
      
      res.json({
        query,
        results: searchResults
      });
    } catch (err) {
      const error = err as Error;
      console.error("Error searching thirukkurals:", error);
      res.status(500).json({ message: `Failed to search thirukkurals: ${error.message}` });
    }
  });

  // Endpoint to get audio for a Thirukkural (TTS)
  app.get("/api/audio/:language/:number", async (req, res) => {
    try {
      const { language, number } = req.params;
      const thirukkuralNumber = Number(number);
      
      if (isNaN(thirukkuralNumber)) {
        return res.status(400).json({ message: "Invalid thirukkural number" });
      }
      
      if (language !== "tamil" && language !== "english") {
        return res.status(400).json({ message: "Invalid language. Use 'tamil' or 'english'" });
      }
      
      const thirukkural = await storage.getThirukkuralByNumber(thirukkuralNumber);
      if (!thirukkural) {
        return res.status(404).json({ message: "Thirukkural not found" });
      }
      
      // Get the text for the selected language
      // Use raw text without <br> tags which will be handled by the Python script
      const text = language === "tamil" ? thirukkural.tamil : thirukkural.english;
      
      console.log(`Generating ${language} audio for kural ${thirukkuralNumber}: ${text}`);
      
      // Use gTTS Python script to generate audio data
      try {
        const ttsResult = await runPythonScript("tts.py", [text, language]);
        let parsedResult;
        
        if (typeof ttsResult === 'string') {
          parsedResult = JSON.parse(ttsResult);
        } else {
          parsedResult = ttsResult;
        }
        
        if (parsedResult && parsedResult.audio_data) {
          // Return both the base64 audio data and the clean text (without BR tags)
          res.json({
            text: parsedResult.text,
            audio_data: parsedResult.audio_data,
            content_type: "audio/mp3"
          });
        } else {
          throw new Error("Failed to generate audio data");
        }
      } catch (ttsError) {
        console.error("Error generating TTS:", ttsError);
        throw new Error("Failed to generate audio");
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ message: "Failed to generate audio" });
    }
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const chatSchema = z.object({
        message: z.string().min(1),
        sessionId: z.string().optional(),
      });
      
      const validatedData = chatSchema.parse(req.body);
      const { message } = validatedData;
      const sessionId = validatedData.sessionId || (req as any).sessionID || "anonymous";
      
      // Store user message
      await storage.addChatMessage({
        sessionId,
        isUser: true,
        message,
        timestamp: new Date().toISOString(),
        metadata: null
      });
      
      // Search for relevant Thirukkural verses to provide context for the AI
      let relevantVerses;
      try {
        const searchResults = await runPythonScript("faiss-search.py", [message, "3"]);
        
        // Parse search results if needed
        if (typeof searchResults === 'string') {
          const jsonMatch = searchResults.match(/\[.*\]/);
          if (jsonMatch) {
            try {
              relevantVerses = JSON.parse(jsonMatch[0]);
            } catch (jsonError) {
              console.error("Failed to parse extracted JSON:", jsonError);
              relevantVerses = [];
            }
          } else {
            relevantVerses = [];
          }
        } else {
          relevantVerses = searchResults || [];
        }
        
        // Process the search results to get full Thirukkural objects
        relevantVerses = await storage.processSearchResults(relevantVerses);
      } catch (searchError) {
        console.error("Error searching for relevant Thirukkurals:", searchError);
        relevantVerses = [];
      }
      
      // Generate a thoughtful, contextual response about Thirukkural wisdom
      // Reference specific verses when relevant
      let response;
      
      // In this implementation, we're generating a response based on the search results
      // and making it more contextual and useful than a simple placeholder
      if (relevantVerses.length > 0) {
        // Prepare information about the found verses
        const verseNumbers = relevantVerses.map(v => v.thirukkural.number);
        const chapterNumbers = [...new Set(relevantVerses.map(v => v.thirukkural.chapter))];
        const verse = relevantVerses[0].thirukkural;
        
        // Create a response that incorporates the wisdom from the relevant verses
        const responseText = `Based on Thirukkural wisdom, I can share insights related to your question about "${message}".

In verse ${verse.number} from the chapter on ${verse.chapterName}, Thiruvalluvar says:
"${verse.english}"

This teaches us that ${verse.englishExplanation.substring(0, 150)}...

I hope this ancient wisdom provides guidance for your question. Would you like me to elaborate on any specific aspect?`;
        
        response = {
          message: responseText,
          references: {
            verseNumbers,
            chapterNumbers
          }
        };
      } else {
        // Fallback response when no relevant verses are found
        response = {
          message: `I understand you're asking about "${message}". While I don't have specific Thirukkural verses directly addressing this, Thiruvalluvar's wisdom encompasses many aspects of life including ethics, personal conduct, relationships, and governance. Would you like me to search for wisdom on a related topic? Perhaps try more specific terms like friendship, patience, or virtue.`,
          references: {
            verseNumbers: [],
            chapterNumbers: []
          }
        };
      }
      
      // Store AI response
      await storage.addChatMessage({
        sessionId,
        isUser: false,
        message: response.message,
        timestamp: new Date().toISOString(),
        metadata: response.references
      });
      
      res.json(response);
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Endpoint to get chat history
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
