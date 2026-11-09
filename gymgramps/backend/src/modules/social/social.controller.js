import { supabaseAdmin as supabase } from '../../db/supabaseClient.js';

export const getLeaderboard = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'Falta o userId' });

        // Simulação do leaderboard misturando o user com fake friends pra MVP
        const leaderboard = [
            { id: 'user-1', name: 'Willy', xp: 2500, avatar: '👤' },
            { id: 'user-2', name: 'Carlos (Amigo)', xp: 2100, avatar: '🏃' },
            { id: userId, name: 'Você', xp: 1050, avatar: '🔥' }
        ].sort((a, b) => b.xp - a.xp);

        return res.status(200).json(leaderboard);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar liga social' });
    }
};

export const inviteFriend = async (req, res) => {
    try {
        const { userId, inviteCode } = req.body;
        if (!userId || !inviteCode) return res.status(400).json({ error: 'Faltam dados' });

        return res.status(200).json({ success: true, message: 'Amigo convidado para a sua liga!' });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao convidar amigo' });
    }
};
