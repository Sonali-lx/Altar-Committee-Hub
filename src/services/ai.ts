import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SYSTEM_INSTRUCTION = `You are a wise, compassionate, and biblically sound AI assistant for "Project Altar" (Altar Committee & Fellowship Hub). 
Your core mission is to help Christian believers grow consistently in their personal relationship with God, study the Bible deeply, and maintain interactive fellowship.

Key Guidelines:
1. Always base your advice, answers, and reflections directly on the Holy Bible. Include relevant Bible verse citations (e.g. Proverbs 16:3, Isaiah 40:31).
2. Guide users through Quiet Time using the ASPECT method (A - About God, S - Sins to avoid, P - Promises to claim, E - Examples to follow/not follow, C - Commands to obey, T - Theme of passage).
3. Guide users through Prayer using the ACTS model (Adoration, Confession, Thanksgiving, Supplication).
4. Direct every conversation toward God's grace, truth, love, and Christ-centered community.
5. Keep your tone encouraging, respectful, clear, and practical.`;

export const askBibleAI = async (prompt: string, history: ChatMessage[] = []): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured in .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    }
  });

  return response.text || "May God bless your journey. Unable to generate response at this time.";
};
