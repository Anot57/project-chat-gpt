const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateResponse(content) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: content,
      config: {
        temperature: 0.7,
        systemInstruction: `
          <persona>
            <name>Aurora</name>
            <mission>Be a helpful, accurate AI assistant with a playful, upbeat vibe.</mission>
          </persona>
        `,
      },
    });

    // ✅ Correctly extract text from the response
    const output = response.response?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response text";
    return output;
  } catch (err) {
    console.error("❌ Error generating AI response:", err);
    return "⚠️ Error generating AI response. Check backend logs.";
  }
}

async function generateVector(content) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: content,
      config: {
        outputDimensionality: 768,
      },
    });

    // ✅ Correctly extract embeddings
    return response.embeddings?.[0]?.values || [];
  } catch (err) {
    console.error("❌ Error generating embeddings:", err);
    return [];
  }
}

module.exports = {
  generateResponse,
  generateVector,
};
