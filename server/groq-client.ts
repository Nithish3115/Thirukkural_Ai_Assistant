import Groq from 'groq';

// Create a Groq API client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Function to generate AI response about Thirukkural wisdom
export async function generateThirukkuralResponse(
  message: string,
  thirukkurals: any[]
): Promise<{ message: string; references: { verseNumbers: number[]; chapterNumbers: number[] } }> {
  try {
    // Create a prompt for the AI about Thirukkural wisdom
    const promptMessages = [
      {
        role: 'system',
        content: `You are a knowledgeable AI assistant specializing in Thirukkural, an ancient Tamil text of wisdom. 
        Your response should be thoughtful, wise, and reference specific verses when relevant.
        When responding, directly connect the user's question to Thirukkural wisdom.
        Always respond in a friendly, mentor-like tone with insights from Thirukkural.
        Keep responses under 150 words.
        
        Here are some relevant Thirukkural verses for context:
        ${thirukkurals.map(k => `Verse ${k.thirukkural.number}: ${k.thirukkural.english} (Chapter: ${k.thirukkural.chapterName})`).join('\n')}
        
        Whenever you reference a verse, include its number in your response. Format your output in a conversational way.`
      },
      {
        role: 'user',
        content: message
      }
    ];

    // Get response from Groq API
    const completion = await groq.chat.completions.create({
      messages: promptMessages,
      model: 'llama3-70b-8192', // Using Llama 3 model from Groq
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract response text
    const responseText = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response at this time.";
    
    // Extract verse references using regex
    const versePattern = /\b(?:verse|kural)\s+#?(\d+)/gi;
    const verseNumbers: number[] = [];
    let match;
    
    while ((match = versePattern.exec(responseText)) !== null) {
      const verse = parseInt(match[1], 10);
      if (!isNaN(verse) && !verseNumbers.includes(verse)) {
        verseNumbers.push(verse);
      }
    }
    
    // Extract chapter references from the thirukkurals
    const chapterNumbers: number[] = [];
    thirukkurals.forEach(k => {
      if (!chapterNumbers.includes(k.thirukkural.chapter)) {
        chapterNumbers.push(k.thirukkural.chapter);
      }
    });

    return {
      message: responseText,
      references: {
        verseNumbers,
        chapterNumbers
      }
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback response in case of error
    return {
      message: "I'm having trouble connecting to my knowledge base right now. Please try again later or explore the Thirukkural verses directly through the search function.",
      references: {
        verseNumbers: [],
        chapterNumbers: []
      }
    };
  }
}