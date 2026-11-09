import { supabase } from "../lib/supabaseClient.js";

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// retorna { precisaConfirmarEmail }
export async function signUpWithPassword(email, password, apelido) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { apelido }
    }
  });
  if (error) throw error;
  return { precisaConfirmarEmail: !data.session };
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signOut() {
  localStorage.removeItem('gymgramps_perfil');
  localStorage.removeItem('gymgramps_treino');
  localStorage.removeItem('gymgramps_dieta');
  localStorage.removeItem('gymgramps_cronograma');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function deleteAccount() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (token) {
    const res = await fetch('http://localhost:3000/api/users/me', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error("Erro ao deletar conta no servidor.");
      throw new Error("Erro ao excluir conta");
    }
  }

  localStorage.removeItem('gymgramps_perfil');
  localStorage.removeItem('gymgramps_treino');
  localStorage.removeItem('gymgramps_dieta');
  localStorage.removeItem('gymgramps_cronograma');
  localStorage.removeItem('sb-rnjkksfzyihckpskzzw-auth-token');

  await signOut();
}
