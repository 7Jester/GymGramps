import { supabaseAdmin as supabase } from '../../db/supabaseClient.js';

export const getDailyMissions = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'Falta o userId' });

        // Simulação de retorno de missões geradas via gamificação
        const missions = [
            { id: 1, text: 'Treine 3 dias seguidos', rewardXp: 50, completed: false },
            { id: 2, text: 'Bata 100g de proteína hoje', rewardXp: 30, completed: false },
            { id: 3, text: 'Beba 3 litros de água', rewardXp: 20, completed: true }
        ];

        return res.status(200).json(missions);
    } catch (error) {
        console.error('Missions error:', error);
        return res.status(500).json({ error: 'Erro ao buscar missões' });
    }
};

export const claimMission = async (req, res) => {
    try {
        const { userId, missionId, rewardXp } = req.body;
        if (!userId || !missionId) return res.status(400).json({ error: 'Faltam dados da missão' });

        // Aqui conectaria com o Índice GG (update no user score)
        return res.status(200).json({ success: true, message: `+${rewardXp} XP resgatado!`, totalXp: 1050 });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao resgatar missão' });
    }
};
