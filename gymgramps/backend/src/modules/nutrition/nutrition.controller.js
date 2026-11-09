import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Você é um nutricionista especialista em visão computacional e estimativa visual de porções alimentares.
Sua tarefa é analisar a imagem de uma refeição e:
1. Identificar cada item alimentar visível.
2. Estimar a porção de cada item em gramas com base na proporção visual do prato, talheres ou dimensões relativas da cena.
3. Calcular calorias (kcal) e macronutrientes (proteínas, carboidratos, gorduras e fibras) com base no peso estimado e tabelas de referência nutricional (ex: TACO/USDA).
4. Retornar os nomes dos alimentos em português.

Regras estritas:
- A resposta deve ser EXATAMENTE E UNICAMENTE UM JSON VÁLIDO.
- Seja realista nas porções (ex: prato raso médio tem ~25cm de diâmetro; 1 colher de arroz cheia ~40-50g).
- Se a imagem não for de comida, retorne o campo "is_food": false e lista vazia de itens.
- NÃO ADICIONE BLOCOS DE MARKDOWN NA RESPOSTA (\`\`\`json). APENAS O TEXTO BRUTO DO JSON.`;

const JSON_SCHEMA = {
    type: "object",
    properties: {
        is_food: { type: "boolean" },
        confidence_level: { type: "string" },
        total_nutrition: {
            type: "object",
            properties: {
                calories_kcal: { type: "number" },
                protein_g: { type: "number" },
                carbohydrates_g: { type: "number" },
                fats_g: { type: "number" },
                fiber_g: { type: "number" }
            }
        },
        detected_items: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    estimated_weight_g: { type: "number" },
                    calories_kcal: { type: "number" },
                    protein_g: { type: "number" },
                    carbohydrates_g: { type: "number" },
                    fats_g: { type: "number" },
                    fiber_g: { type: "number" }
                }
            }
        }
    }
};

export const analyzeDish = async (req, res) => {
    try {
        const { image_base64 } = req.body;

        if (!image_base64) {
            return res.status(400).json({ error: "Base64 image is required." });
        }

        // Remover cabeçalho data:image/jpeg;base64, se houver
        const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");

        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: SYSTEM_PROMPT },
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: "image/jpeg"
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
                responseSchema: JSON_SCHEMA
            }
        });

        const textResponse = result.response.text();
        const jsonResponse = JSON.parse(textResponse);

        res.json(jsonResponse);
    } catch (error) {
        console.error("[analyzeDish Error]:", error);
        res.status(500).json({ error: "Failed to analyze dish using Vision AI." });
    }
};
