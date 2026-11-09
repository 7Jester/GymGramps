import { generateJSON } from '../../ai/geminiClient.js';
import { getPromptTreino, getPromptDieta, getPromptCronograma, getPromptPlanoFinal } from '../../ai/prompts/onboardingPrompts.js';
import { generateStaticTreino } from './workoutMatcher.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const exerciseSubstitutes = require('../../data/exercise_substitutes.json');
export async function gerarTreino(req, res) {
    try {
        const { perfil, rotina, frequencia, local } = req.body;
        // NOVA ARQUITETURA: Consulta no banco de dados pré-gerado (Assembly Flow) ao invés de inferência lenta via IA
        const resultado = generateStaticTreino(perfil, frequencia, local);
        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao gerar treino estático' });
    }
}

export async function gerarDieta(req, res) {
    try {
        const { perfil, rotina, treinoPlan, restricoes } = req.body;
        const prompt = getPromptDieta(perfil, rotina, treinoPlan, restricoes);
        const resultado = await generateJSON(prompt);
        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao gerar dieta' });
    }
}

export async function gerarCronograma(req, res) {
    try {
        const { perfil, rotina, treinoPlan, dietaPlan } = req.body;
        const prompt = getPromptCronograma(perfil, rotina, treinoPlan, dietaPlan);
        const resultado = await generateJSON(prompt);
        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao gerar cronograma' });
    }
}

export async function gerarPlanoFinal(req, res) {
    try {
        const { perfil, rotina, frequencia, local, restricoes } = req.body;

        // 1. Pega o Treino do Banco Offline (Zero Latência)
        const treinoEstatico = generateStaticTreino(perfil, frequencia, local);

        // 2. Chama a IA apenas para Dieta e Cronograma, o que gasta pouquíssimo token
        const prompt = getPromptPlanoFinal(perfil, rotina, frequencia, local, restricoes, treinoEstatico);
        const iaResult = await generateJSON(prompt);

        // 3. Mescla o objeto e entrega pro Frontend
        const resultadoGeral = {
            treino: treinoEstatico,
            dieta: iaResult.dieta,
            cronograma: iaResult.cronograma
        };

        res.json(resultadoGeral);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao gerar plano final' });
    }
}

export async function sugerirSubstituicao(req, res) {
    try {
        const { exercicio } = req.body;

        if (!exercicio) {
            return res.status(400).json({ error: 'Nome do exercício ausente' });
        }

        // 1. Tentar encontrar no dicionário estático (zero latência)
        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const nomeAlvo = normalize(exercicio);

        const chaveEncontrada = Object.keys(exerciseSubstitutes).find(key => normalize(key) === nomeAlvo) ||
            Object.keys(exerciseSubstitutes).find(key => normalize(key).includes(nomeAlvo));

        if (chaveEncontrada && exerciseSubstitutes[chaveEncontrada]) {
            console.log(`[Catalog Hit] Substituição estática rápida para: ${exercicio}`);
            return res.json({ sugestoes: exerciseSubstitutes[chaveEncontrada] });
        }

        // 2. Se não encontrar uma correspondência óbvia no catálogo local, usar IA
        console.log(`[AI Fallback] Buscando substituição via Gemini IA para: ${exercicio}`);
        const prompt = `Liste EXATAMENTE 4 exercícios substitutos diretos para o exercício livre/máquina "${exercicio}" na musculação, visando atingir o mesmo principal grupamento muscular. Retorne SOMENTE JSON valido, sem crases markdown, no formato estrito: { "sugestoes": ["Nome 1", "Nome 2", "Nome 3", "Nome 4"] }`;
        const resultado = await generateJSON(prompt);
        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao sugerir substituicao' });
    }
}
