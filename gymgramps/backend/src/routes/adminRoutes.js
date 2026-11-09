import express from 'express';
import { supabaseAdmin } from '../db/supabaseClient.js';

const router = express.Router();

router.get('/users', async (req, res) => {
    // Para fins de dev/teste, a senha mestra passada por header ou query
    const pass = req.headers['x-admin-password'] || req.query.pw;
    if (pass !== 'gg2026admin') {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    try {
        // Usa o supabaseAdmin (Service Role) para bater em user_state ignorando RLS
        // Seleciona tudo (ou só o que importa pro admin)
        const { data, error } = await supabaseAdmin
            .from('user_state')
            .select('id, perfil, treino, updated_at');

        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar no Supabase' });
        }

        // Formatar para o Admin Frontend
        const formatted = data.map(d => ({
            id: d.id,
            email: d.perfil?.email || `Usuario_Simulado_${d.id.substring(0, 4)}`,
            apelido: d.perfil?.apelido || 'Sem nome',
            created_at: d.updated_at,
            objetivo: d.perfil?.objetivo || 'Não definido',
            dias_treino: d.treino?.diasPorSemana || '-',
        }));

        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Error');
    }
});

export default router;
