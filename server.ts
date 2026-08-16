import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API routes
  app.post("/api/extract-receipt", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      
      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const prompt = `
      You are an AI assistant helping a treasurer extract financial data from a receipt.
      Analyze the receipt document (which can be an image or a PDF) and extract the following:
      1. Receipt Number (if available)
      2. Receipt Date (if available)
      3. Total Receipt Amount (number)
      4. A list of member contributions if present. Often they are handwritten names with amounts.

      Return the data STRICTLY as a JSON object with this structure:
      {
        "receiptNumber": "string or null",
        "receiptDate": "string or null",
        "totalAmount": number,
        "memberContributions": [
          { "name": "string", "amount": number }
        ]
      }
      `;

      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured on server" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: mimeType,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) {
        return res.status(500).json({ error: "No response from AI" });
      }

      const parsedData = JSON.parse(text);
      res.json(parsedData);

    } catch (error: any) {
      console.error("Error extracting receipt:", error);
      res.status(500).json({ error: error.message || "Failed to extract receipt data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
