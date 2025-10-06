import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analyzeImage(imageUrl) {
  try {
    const prompt =
      "Detect whether people in this image are wearing PPE like helmets, vests, gloves, or safety shoes.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageUrl, // you can also send a base64 image here
        },
      },
    ]);

    const response = await result.response.text();
    return response;
  } catch (error) {
    console.error("Gemini error:", error);
    throw new Error("Failed to analyze image with Gemini");
  }
}
