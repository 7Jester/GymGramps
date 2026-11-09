import React, { useState, useEffect } from 'react';

export function ThemeToggle({ className = '' }) {
    const getInitialTheme = () => {
        const saved = localStorage.getItem('gg-theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const [theme, setTheme] = useState(getInitialTheme());

    useEffect(() => {
        const root = document.documentElement;
        root.dataset.theme = theme;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('gg-theme', theme);
    }, [theme]);

    const handleToggle = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            type="button"
            className={`icon-btn ${className}`}
            onClick={handleToggle}
            title="Alternar tema"
        >
            {theme === 'dark' ? '☀' : '☾'}
        </button>
    );
}
