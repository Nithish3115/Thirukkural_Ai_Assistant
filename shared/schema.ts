import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the existing one)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Thirukkural schema
export const thirukkurals = pgTable("thirukkurals", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  chapter: integer("chapter").notNull(),
  chapterName: text("chapter_name").notNull(),
  sectionName: text("section_name").notNull(),
  tamil: text("tamil").notNull(),
  english: text("english").notNull(),
  tamilExplanation: text("tamil_explanation"),
  englishExplanation: text("english_explanation"),
  vector: text("vector"),  // Store the FAISS vector as string
});

export const insertThirukkuralSchema = createInsertSchema(thirukkurals).omit({
  id: true,
  vector: true,
});

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  isUser: boolean("is_user").notNull(),
  message: text("message").notNull(),
  timestamp: text("timestamp").notNull(),
  metadata: jsonb("metadata"),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
});

// Search history schema
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  query: text("query").notNull(),
  results: jsonb("results"),
  timestamp: text("timestamp").notNull(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertThirukkural = z.infer<typeof insertThirukkuralSchema>;
export type Thirukkural = typeof thirukkurals.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// Define search result type
export type SearchResult = {
  thirukkural: Thirukkural;
  score: number;
  relevance: number;
};

// Define AI response type
export type AIResponse = {
  message: string;
  references?: {
    verseNumbers?: number[];
    chapterNumbers?: number[];
  };
};
