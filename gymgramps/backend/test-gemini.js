import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function testModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const results = [];
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("hello");
            results.push(`Success with: ${modelName}`);
        } catch (e) {
            results.push(`Failed with: ${modelName} - ${e.message}`);
        }
    }
    fs.writeFileSync('test-results.txt', results.join('\n'));
}
testModels();
