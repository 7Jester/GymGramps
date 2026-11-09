import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

const catalogPath = path.join(__dirname, '../data/exercise_catalog.json');
const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Schema ajustado para um "plano de treino" completo, não apenas um treino isolado
const fullPlanSchema = {
    type: "object",
    properties: {
        perfil_alvo: { type: "string" },
        frequencia_semanal: { type: "number" },
        treinos: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    treino_nome: { type: "string", description: "Ex: Treino A - Peito, Ombro e Tríceps" },
                    objetivo_metabolico: { type: "string" },
                    exercicios: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id_exercicio: { type: "number" },
                                series_aquecimento: { type: "number" },
                                series_trabalho: { type: "number" },
                                reps_alvo: { type: "string" },
                                rir_alvo: { type: "number" },
                                rest_seconds: { type: "number" },
                                tecnica_avancada: { type: "string", description: "Opcional, ou null" }
                            },
                            required: ["id_exercicio", "series_aquecimento", "series_trabalho", "reps_alvo", "rir_alvo", "rest_seconds"]
                        }
                    }
                },
                required: ["treino_nome", "objetivo_metabolico", "exercicios"]
            }
        }
    },
    required: ["perfil_alvo", "frequencia_semanal", "treinos"]
};

// Aqui definimos a MATRIZ de combinações. A divisão se adapta à disponibilidade (dias) de forma inteligente.
const perfisDeTreino = [
    // --- 3 Dias (Frequência Baixa) ---
    { nivel: "Iniciante", dias: 3, divisao: "Fullbody (Corpo Todo) 3x" },
    { nivel: "Intermediário", dias: 3, divisao: "Fullbody 3x ou AB(Upper/Lower) + Fullbody" },
    { nivel: "Avançado", dias: 3, divisao: "Push / Pull / Legs (PPL)" },

    // --- 4 Dias (Frequência Média) ---
    { nivel: "Iniciante", dias: 4, divisao: "Upper/Lower 2x" },
    { nivel: "Intermediário", dias: 4, divisao: "Upper/Lower 2x" },
    { nivel: "Avançado", dias: 4, divisao: "Upper/Lower 2x (Volume alto)" },

    // --- 5 Dias (Frequência Alta) ---
    { nivel: "Iniciante", dias: 5, divisao: "Iniciantes geralmente não devem treinar 5 dias seguidos, gerar Upper/Lower/Descanso/Push/Pull/Legs com volume baixo" },
    { nivel: "Intermediário", dias: 5, divisao: "Upper/Lower/Push/Pull/Legs" },
    { nivel: "Avançado", dias: 5, divisao: "Bro-Split (ABCDE) ou Upper/Lower/PPL" }
];

async function generateBatch() {
    console.log("Iniciando geração em lote (Batch Assembly Flow)...\\n");
    const generatedRoutines = [];

    for (const perfil of perfisDeTreino) {
        console.log(`Gerando plano para: ${perfil.nivel} | ${perfil.dias} dias...`);

        const promptContext = `
Você é uma inteligência artificial especialista em fisiculturismo.
Seu trabalho é gerar a ROTINA DE TREINO COMPLETA (todos os treinos da semana) usando APENAS os IDs do catálogo abaixo.
NÃO INVENTE EXERCÍCIOS. USE SOMENTE OS IDs VERDADEIROS DO CATÁLOGO E NENHUM OUTRO.

Perfil Atual:
- Nível: ${perfil.nivel}
- Frequência: ${perfil.dias} dias na semana
- Divisão Alvo Sugerida: ${perfil.divisao}

Catálogo de Exercícios (ID: Nome - Músculo Principal):
${catalogData.map(e => `${e.id}: ${e.nome} (${e.grupoMuscular})`).join('\\n')}

Retorne APENAS um objeto JSON de acordo com o Schema solicitado.
        `;

        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: promptContext }] }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            });

            let responseText = result.response.text();

            // Garantir extração limpa caso retorne markdown
            responseText = responseText.replace(/^\\s*\\x60\\x60\\x60json\\n?/i, '').replace(/\\n?\\x60\\x60\\x60\\s*$/i, '');

            const parsed = JSON.parse(responseText);
            generatedRoutines.push(parsed);
            console.log(`=> Sucesso! Rotina para ${perfil.nivel} gerada.`);

            // Evitar limites de requisição por minuto na API
            await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (e) {
            console.error(`Erro ao gerar ${perfil.nivel} - ${perfil.dias} dias:`, e.message);
        }
    }

    // Salva o "banco de dados" completo gerado
    const dbPath = path.join(__dirname, '../data/pre_generated_workouts_db.json');
    fs.writeFileSync(dbPath, JSON.stringify(generatedRoutines, null, 2));
    console.log(`\\nLote finalizado! Todas as rotas salvas no arquivo ${dbPath}`);
}

generateBatch();
