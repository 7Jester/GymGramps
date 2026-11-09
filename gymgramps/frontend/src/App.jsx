import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Treino from './pages/Treino.jsx';
import Alimentacao from './pages/Alimentacao.jsx';
import Perfil from './pages/Perfil.jsx';
import Chat from './pages/Chat.jsx';
import Cronograma from './pages/Cronograma.jsx';
import Onboarding from './pages/onboarding/Onboarding.jsx';
import AdminDashboard from './pages/Admin.jsx';
import AvaliacaoQuinzenal from './components/fase2/AvaliacaoQuinzenal.jsx';

import { GGStyles } from './components/fase2/gg.jsx';

export default function App() {
    return (
        <BrowserRouter>
            <GGStyles />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/treino" element={<Treino />} />
                <Route path="/alimentacao" element={<Alimentacao />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/cronograma" element={<Cronograma />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/avaliacao" element={<AvaliacaoQuinzenal />} />
            </Routes>
        </BrowserRouter>
    );
}
