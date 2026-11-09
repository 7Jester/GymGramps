import { supabase } from '../lib/supabaseClient.js';

export async function fetchUserData(userId) {
    const { data, error } = await supabase
        .from('user_state')
        .select('perfil, treino, dieta, cronograma, refeicoes')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error("Erro ao buscar dados do usuário:", error);
        return null;
    }
    return data; // returns null if no row found, or the data object
}

export async function saveUserData(userId, payload) {
    // payload can contain any subset of: { perfil, treino, dieta, cronograma, refeicoes }
    // We use Upsert to insert if it doesn't exist or update if it does.

    const { error } = await supabase
        .from('user_state')
        .upsert({
            id: userId,
            ...payload,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (error) {
        console.error("Erro ao salvar dados do usuário:", error);
        throw error;
    }
}
