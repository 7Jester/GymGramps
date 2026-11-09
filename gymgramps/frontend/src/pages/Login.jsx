import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { signInWithPassword, getSession } from '../js/api/authApi.js';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // The app will now always show the login screen until the user explicitly logs in.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await signInWithPassword(email, password);
            const savedCrono = localStorage.getItem('gymgramps_cronograma');
            if (!savedCrono) {
                navigate('/onboarding');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="view auth" style={{ display: 'grid' }}>
            <div className="brand-panel">
                <div className="logo"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M50.79 38.84A20 20 0 1 1 50.79 25.16" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /><path className="brand-mark-bar" d="M30 32H55" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /></svg></span><span className="word">GymGramps</span></div>
                <div>
                    <div className="eyebrow">Treino · Dieta · Rotina</div>
                    <h1>Seu plano, no seu ritmo.</h1>
                    <p>Um plano de treino e alimentação que cabe entre a faculdade, o trabalho e a academia.</p>
                </div>
                <div className="stats">
                    <div><b>5×</b><span>por semana</span></div>
                    <div><b>6</b><span>refeições/dia</span></div>
                    <div><b>2 min</b><span>para configurar</span></div>
                </div>
                <div className="ring a"></div>
                <div className="ring b"></div>
            </div>

            <div className="auth-form">
                <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '392px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '34px' }}>
                        <div className="tabs" style={{ marginBottom: 0, flex: 1 }}>
                            <button type="button" aria-selected="true">Entrar</button>
                            <button type="button" aria-selected="false" onClick={() => navigate('/cadastro')}>Criar conta</button>
                        </div>
                        <div className="tabs" style={{ marginBottom: 0, marginLeft: '12px' }}>
                            <ThemeToggle />
                        </div>
                    </div>

                    <h2>Bem-vindo de volta</h2>
                    <p className="lede">Entre para ver o treino e as refeições de hoje.</p>

                    <div className="fields">
                        <label>
                            <span className="label">E-mail</span>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            <span className="label label-row">Senha <Link to="#">Esqueci</Link></span>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </label>
                    </div>

                    {error && <p style={{ fontSize: '13px', color: 'var(--danger)', marginTop: '8px' }}>{error}</p>}

                    <button type="submit" disabled={isLoading} className="btn-primary">
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <p className="legal" style={{ marginTop: '32px' }}>
                        Ao continuar você aceita os <Link to="#">termos de uso</Link> e a <Link to="#">política de privacidade</Link>.
                        O GymGramps é educativo e não substitui nutricionista (CFN) ou profissional de Educação Física (CREF).
                    </p>
                </form>
            </div>
        </div>
    );
}
