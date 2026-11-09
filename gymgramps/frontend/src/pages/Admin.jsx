import React, { useState } from 'react';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';

export default function AdminDashboard() {
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:3000/api/admin/users?pw=${password}`);
            if (!res.ok) {
                throw new Error('Senha incorreta ou erro no servidor.');
            }
            const data = await res.json();
            setUsers(data);
            setAuthenticated(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!authenticated) {
        return (
            <>
                <Header />
                <main className="wrap" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
                        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Área Administrativa</h1>
                        <p style={{ color: 'var(--ink-muted)', marginBottom: '24px' }}>Digite a senha de homologação corporativa para ver e testar os perfis.</p>

                        <form onSubmit={handleLogin}>
                            <label className="field" style={{ marginBottom: '20px' }}>
                                <span>Senha Mestra</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Digite a senha..."
                                    required
                                />
                            </label>

                            {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

                            <button type="submit" className="btn-block" disabled={loading}>
                                {loading ? 'Entrando...' : 'Acessar Administrador'}
                            </button>
                        </form>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="wrap">
                <section className="screen">
                    <div className="page-head" style={{ marginBottom: '32px' }}>
                        <div className="eyebrow" style={{ color: 'var(--brand)' }}>BACKOFFICE</div>
                        <h1>Visão Geral de Usuários ({users.length})</h1>
                    </div>

                    <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
                                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>ID / Email</th>
                                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Apelido</th>
                                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Objetivo</th>
                                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Treino</th>
                                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Atualizado (JSON)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--line-faint)' }}>
                                        <td style={{ padding: '16px', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{u.email}<br /><span style={{ fontSize: '10px', color: 'var(--ink-faint)' }}>{u.id}</span></td>
                                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: 'bold' }}>{u.apelido}</td>
                                        <td style={{ padding: '16px', fontSize: '14px', textTransform: 'capitalize' }}>{u.objetivo?.replace('_', ' ')}</td>
                                        <td style={{ padding: '16px', fontSize: '14px' }}>{u.dias_treino} d/sem</td>
                                        <td style={{ padding: '16px', fontSize: '13px', color: 'var(--ink-soft)' }}>{new Date(u.created_at).toLocaleString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-muted)' }}>Nenhum usuário no banco.</div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
