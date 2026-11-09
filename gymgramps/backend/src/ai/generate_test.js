import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import workoutSchema from '../data/workout_schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') }); // Carrega o env da raiz do backend

async function testWorkoutGeneration() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY não encontrada no .env!");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // Lendo o catálogo
    const catalogPath = path.join(__dirname, '../data/exercise_catalog.json');
    const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

    // Definindo o prompt
    const promptContext = `
Você é uma inteligência artificial especialista em periodização de hipertrofia.
O seu trabalho é MONTAR UM TREINO usando RIGOROSAMENTE apenas os IDs fornecidos no catálogo abaixo.
NÃO INVENTE EXERCÍCIOS. USE SOMENTE OS IDs DO CATÁLOGO E NADA MAIS.

O perfil do usuário é:
- Objetivo: Hipertrofia
- Nível: Intermediário
- Solicitação: Montar o 'Treino A' focado em Peitoral, Deltoide Frontal/Lateral e Tríceps.

Aqui está o formato JSON obrigatório (Schema) que você deve devolver:
${JSON.stringify(workoutSchema, null, 2)}

Aqui está o Catálogo de Exercícios Mestre (escolha de 5 a 6 exercícios que tenham sinergia para esse perfil, respeitando a ordem anatômica - peito, ombro, tríceps):
${JSON.stringify(catalogData.filter(e => ["Peitoral", "Deltoide", "Deltoide Lateral", "Tríceps"].includes(e.grupoMuscular)), null, 2)}
    `;

    try {
        console.log("Chamando o Gemini 3.6 Flash para gerar o treino (Assemble Flow)...");
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: promptContext }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const responseText = result.response.text();
        fs.writeFileSync('train_output.json', responseText);
        console.log("JSON gerado com SUCESSO! Salvo em train_output.json");

    } catch (e) {
        fs.writeFileSync('train_error.txt', e.toString() + '\\n' + e.message);
        console.error("Erro na geração:", e.message);
    }
}

testWorkoutGeneration();
