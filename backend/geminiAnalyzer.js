
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set in .env for the backend.");
}
// Initialize with a default key if missing, to prevent crash, but log error.
const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY_IN_ENV" });

const mapToPoliticalBiasEnum = (biasStr) => {
  if (!biasStr) return "Unknown";
  const lowerBiasStr = biasStr.toLowerCase();
  if (lowerBiasStr.includes("republican")) return "Republican";
  if (lowerBiasStr.includes("democratic")) return "Democratic";
  if (lowerBiasStr.includes("neutral")) return "Neutral";
  return "Unknown";
};

const analyzeArticleContent = async (articleText) => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured in the backend.");
  }
  if (!articleText || articleText.trim().length < 50) { // Require some minimal text
    console.warn("Article text too short for meaningful analysis, returning defaults.");
    return {
        politicalBias: "Unknown",
        truthfulnessScore: 50, // Default neutral score for very short/missing text
    };
  }

  const prompt = `
Analyze the following news article content for political bias and estimate its truthfulness score.

Article Content:
---
${articleText}
---

Respond strictly in JSON format with the following structure:
{
  "politicalBias": "...", // "Republican", "Democratic", or "Neutral"
  "truthfulnessScore": ... // A number between 0 and 100 (integer)
}

Do not include any explanatory text or markdown.
Consider the language, framing, and choice of facts. For truthfulness, assess the likely factual accuracy of the main claims based on general knowledge, not external real-time verification.
Example:
{
  "politicalBias": "Neutral",
  "truthfulnessScore": 85
}
`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17", // or your preferred model
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.3, // Lower temperature for more deterministic analysis
        }
    });

    let jsonStr = response.text.trim();
    // Robustly strip markdown
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const analysisResult = JSON.parse(jsonStr);
    
    return {
      politicalBias: mapToPoliticalBiasEnum(analysisResult.politicalBias),
      truthfulnessScore: Math.max(0, Math.min(100, parseInt(analysisResult.truthfulnessScore, 10) || 50)),
    };

  } catch (error) {
    console.error("Error analyzing content with Gemini:", error);
    // Return default/unknown values in case of AI error
    return {
      politicalBias: "Unknown",
      truthfulnessScore: 50, // Default neutral score
    };
  }
};

module.exports = { analyzeArticleContent };
