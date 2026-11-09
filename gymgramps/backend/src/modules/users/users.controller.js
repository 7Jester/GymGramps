import { supabaseAdmin } from '../../db/supabaseClient.js';

export async function deleteAccount(req, res) {
    try {
        const userId = req.user.id;

        // Exclui o usuário no Supabase (auth.users)
        // Isso também disparará triggers de exclusão em cascade, se o banco estiver configurado
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            console.error("Erro deletando usuário do Supabase:", error);
            return res.status(500).json({ error: 'Erro ao excluir a conta.' });
        }

        res.status(200).json({ message: 'Conta excluída com sucesso.' });
    } catch (error) {
        console.error("Erro interno exclusão de conta:", error);
        res.status(500).json({ error: 'Erro interno do servidor ao excluir conta' });
    }
}
