import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle.jsx';

const NAV_ITEMS = [
    { route: "dashboard", label: "Início" },
    { route: "cronograma", label: "Rotina" },
    { route: "treino", label: "Treino" },
    { route: "alimentacao", label: "Dieta" },
    { route: "chat", label: "Assistente" },
    { route: "perfil", label: "Perfil" },
];

export function Header() {
    const location = useLocation();
    const activeRoute = location.pathname.substring(1) || 'dashboard';
    // No projeto original o nav tem "treino"

    return (
        <header>
            <div className="bar">
                <div className="logo"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M50.79 38.84A20 20 0 1 1 50.79 25.16" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /><path className="brand-mark-bar" d="M30 32H55" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /></svg></span><span className="word">GymGramps</span></div>
                <nav id="nav">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.route === activeRoute;
                        return (
                            <Link
                                key={item.route}
                                to={`/${item.route}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <ThemeToggle />
                    <Link to="/perfil" className="avatar">W</Link>
                </div>
            </div>
        </header>
    );
}
