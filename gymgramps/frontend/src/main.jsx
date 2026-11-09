import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './css/input.css';

const initTheme = () => {
    const saved = localStorage.getItem('gg-theme');
    const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);
};

initTheme();

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
