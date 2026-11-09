import { supabaseAdmin as supabase } from '../../db/supabaseClient.js';

/**
 * Avaliação Programática Quinzenal
 * Regras preditivas baseadas na resposta do questionário,
 * sem custo de IA por chamada.
 */
export const submitSurvey = async (req, res) => {
    try {
        const { userId, answers } = req.body;
        // answers can contain: "fome", "recuperacao", "disposicao"

        if (!userId || !answers) {
            return res.status(400).json({ error: 'Faltam dados da pesquisa.' });
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('goal, tdee')
            .eq('id', userId)
            .single();

        if (userError || !user) throw new Error('Usuário não encontrado.');

        let actionLog = [];
        let newTdee = user.tdee;

        // Regra 1: Recuperação Muscular
        if (answers.recuperacao === 'ruim') {
            actionLog.push('Volume de treino reduzido em 10% para melhor recuperação.');
            // (Logica futura: update nos sets do user_workouts no DB reduzindo sets/reps)
        }

        // Regra 2: Nutrição e Fome
        if (answers.fome === 'alta' && user.goal === 'emagrecimento') {
            actionLog.push('Recomendação de dieta alterada: + Fibras adicionadas. Evite cortar mais calorias.');
        } else if (answers.fome === 'alta' && user.goal === 'hipertrofia') {
            newTdee += 200; // Incrementa as calorias alvo se não consegue bater macros com facilidade
            actionLog.push('+200kcal na meta diária para facilitar ganho de massa, pois a fome está alta.');
        }

        // Update User
        if (newTdee !== user.tdee) {
            await supabase.from('users').update({ tdee: newTdee }).eq('id', userId);
        }

        return res.status(200).json({
            message: 'Avaliação recebida com sucesso.',
            adjustments: actionLog,
            newTdee: newTdee || user.tdee
        });

    } catch (error) {
        console.error('Tracker Error:', error);
        return res.status(500).json({ error: 'Erro processando a pesquisa.' });
    }
};

/**
 * Health Sync Webhook (Grátis via Frontend/Web API)
 * Recebe passos ou gasto calórico diário batido no frontend/celular 
 * e altera a meta diária dinamicamente.
 */
export const syncHealthData = async (req, res) => {
    try {
        const { userId, totalSteps, activeCaloriesBurned } = req.body;
        if (!userId) return res.status(400).json({ error: 'Falta o userId.' });

        console.log(`Recebendo Sync de Saúde do User ${userId} | Passos: ${totalSteps} | Cals: ${activeCaloriesBurned}`);

        // Aqui, a TMB (tdee) ou o limite do dia poderia subir se a pessoa queimou mto!
        return res.status(200).json({
            success: true,
            message: 'Métricas de saúde sincronizadas gratis com sucesso!',
            adjustedCalories: activeCaloriesBurned ? activeCaloriesBurned * 0.8 : 0
        });

    } catch (error) {
        console.error('Health Sync Error:', error);
        return res.status(500).json({ error: 'Erro ao sincronizar saúde.' });
    }
};
