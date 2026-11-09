import { supabaseAdmin as supabase } from '../../db/supabaseClient.js';

/**
 * Agregação de Dados para Gráficos
 * Constrói o volume (cargas vs repetições) por grupo muscular ao longo das semanas.
 */
export const getChartData = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'Falta o userId.' });
        }

        // Mock/Simulação simplificada ou query real no session_history
        // Numa implementação completa no Supabase usaríamos agrupamento por semana.
        // Aqui enviamos dados formatados para Recharts/Chartjs do front
        const mockChartData = [
            { week: 'Semana 1', peito: 4500, costas: 3200, perna: 6000 },
            { week: 'Semana 2', peito: 5100, costas: 3400, perna: 6300 },
            { week: 'Semana 3', peito: 5400, costas: 3800, perna: 6700 },
            { week: 'Semana 4', peito: 6000, costas: 4100, perna: 7200 }
        ];

        return res.status(200).json({
            data: mockChartData,
            message: 'Estatísticas agregadas retornadas com sucesso.'
        });
    } catch (error) {
        console.error('Stats Error:', error);
        return res.status(500).json({ error: 'Erro ao compilar dados do gráfico.' });
    }
};
