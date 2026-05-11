let apiKey = import.meta.env.VITE_GEMINI_API_KEY;

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1000,
  responseMimeType: "text/plain",
};

// Initialize the chat session ONCE outside the function so it remembers history
const chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [{ text: "Your name is Astra. You are an advanced, intelligent, and highly capable virtual assistant. You were created by Ushant Singh. You provide concise, direct, and helpful answers. You never refer to yourself as a large language model or an AI trained by Google. You are Astra. You are fully capable of understanding both Hindi and English. Always respond in the same language the user uses to talk to you. IMPORTANT: If you respond in Hindi, you MUST write your response in Romanized Hindi (Hinglish) using the English alphabet. Never use Devanagari script." }],
    },
    {
      role: "model",
      parts: [{ text: "Understood. I am Astra, the advanced virtual assistant created by Ushant Singh. I can speak both English and Hindi. Main aapki kaise madad kar sakta hoon?" }],
    },
  ],
});

async function run(prompt) {
  const result = await chatSession.sendMessage(prompt);
  return result.response.text();
}

export default run;