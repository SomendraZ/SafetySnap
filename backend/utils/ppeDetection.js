const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function cleanGeminiOutput(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

async function detectPPE(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64Image = Buffer.from(response.data, "binary").toString("base64");

    const prompt =
  "Detect whether people in this image are wearing PPE like helmets, vests, gloves, or safety shoes. " +
  "Return a JSON array where each object contains: label (string), bbox (array of 4 numbers: x, y, width, height, all normalized 0-1), " +
  "and confidence (0-1). Ensure bbox is never empty. Example: [{\"label\":\"helmet\",\"bbox\":[0.1,0.2,0.3,0.4],\"confidence\":0.95}]";


    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: base64Image } },
    ]);

    const responseText = await result.response.text();
    let detections = [];

    try {
      const cleaned = cleanGeminiOutput(responseText);
      detections = JSON.parse(cleaned);
    } catch (err) {
      console.warn("Failed to parse Gemini output", err);
    }

    return detections;
  } catch (error) {
    console.error("Gemini error:", error);
    return [];
  }
}

module.exports = { detectPPE };
