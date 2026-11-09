import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Google Generative AI with the API key from .env
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const geminiModel = genAI ? genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.6-flash" }) : null;

export async function generateJSON(prompt, retries = 3, delay = 2000) {
    if (!geminiModel) {
        throw new Error('GEMINI_API_KEY is not set in the environment variables.');
    }

    try {
        const result = await geminiModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (err) {
        if (retries > 0) {
            console.warn(`AI generation failed (${err.message}). Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(res => setTimeout(res, delay));
            return generateJSON(prompt, retries - 1, delay * 2);
        }

        console.error("AI generation definitively failed. Raw error:", err.message);
        throw new Error("Erro de comunicação com a Inteligência Artificial após múltiplas tentativas.");
    }
}
