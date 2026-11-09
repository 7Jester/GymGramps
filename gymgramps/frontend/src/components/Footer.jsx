import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer>
            <div className="foot-grid">
                <div className="foot-brand">
                    <div className="foot-logo"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M50.79 38.84A20 20 0 1 1 50.79 25.16" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /><path className="brand-mark-bar" d="M30 32H55" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /></svg></span><span className="word">GymGramps</span></div>
                    <p>Treino, dieta e rotina em um só lugar — montados em volta do dia que você já tem.</p>
                    <div className="socials"><Link to="#">IG</Link><Link to="#">YT</Link><Link to="#">GH</Link></div>
                </div>
                <div className="foot-col">
                    <h4>Produto</h4>
                    <nav><Link to="/treino">Meu treino</Link><Link to="/alimentacao">Minha dieta</Link><Link to="/cronograma">Cronograma</Link><Link to="/chat">Assistente</Link></nav>
                </div>
                <div className="foot-col">
                    <h4>Recursos</h4>
                    <nav><Link to="#">Guia de exercícios</Link><Link to="#">Tabela nutricional</Link><Link to="#">Central de ajuda</Link><Link to="#">Falar com o suporte</Link></nav>
                </div>
                <div className="foot-col">
                    <h4>Legal</h4>
                    <nav><Link to="#">Termos de uso</Link><Link to="#">Privacidade</Link><Link to="#">Cookies</Link><Link to="#">Excluir meus dados</Link></nav>
                </div>
            </div>
            <div className="foot-bottom">
                <p className="note">O GymGramps tem caráter educativo e informativo. As sugestões de treino e alimentação não substituem a avaliação de um nutricionista (CFN) ou de um profissional de Educação Física (CREF).</p>
                <div className="foot-legal">
                    <span className="mono">© 2026 GymGramps · Feito no Brasil</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span className="mono">v1.0.0</span>
                        <span className="status"><i></i>Todos os sistemas operando</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
