const fs = require('fs');

const correctTopPart = `import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons.jsx';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';
import { analyzeSetPerformance } from '../js/utils/ProgressionAdvisor.js';
import { getSession } from '../js/api/authApi.js';
import { fetchUserData, saveUserData } from '../js/api/dbApi.js';

const hojeIsoString = () => new Date().toISOString().split('T')[0];
const getSessoes = () => {
    try { return JSON.parse(localStorage.getItem('gymgramps_sessoes')) || []; }
    catch { return []; }
};
const saveSessoes = (s) => localStorage.setItem('gymgramps_sessoes', JSON.stringify(s));
const addSessao = (s) => saveSessoes([s, ...getSessoes()]);
const jaTreinouHoje = () => getSessoes().some(s => s.data === hojeIsoString());

function formatarData(iso) {
    const [ano, mes, dia] = iso.split("-");
    return \`\${dia}/\${mes}/\${ano}\`;
}

export default function Treino() {
    const [modo, setModo] = useState('view');
    const [logExercicios, setLogExercicios] = useState(null);
    const [plano, setPlano] = useState(null);
    const [sessoes, setSessoes] = useState([]);
    const [session, setSession] = useState(null);

    // Novo Estado: Controlar qual Dia o usuário quer ver detalhadamente
    const [diaSelecionado, setDiaSelecionado] = useState(null);

    // Troca de exercícios (Redesign IA)
    const [trocandoExIdx, setTrocandoExIdx] = useState(null);
    const [novoNomeEx, setNovoNomeEx] = useState('');
    const [isCustomEx, setIsCustomEx] = useState(false);
    const [isModalTrocaOpen, setIsModalTrocaOpen] = useState(false);
    const [isFetchingSugestoes, setIsFetchingSugestoes] = useState(false);
    const [sugestoes, setSugestoes] = useState([]);

    useEffect(() => {
        getSession().then(async (sess) => {
            setSession(sess);
            if (sess?.user) {
                const data = await fetchUserData(sess.user.id);
                if (data?.sessoes) {
                    saveSessoes(data.sessoes);
                    setSessoes(data.sessoes);
                }
                if (data?.treino) {
                    localStorage.setItem('gymgramps_treino', JSON.stringify(data.treino));
                    setPlano(data.treino);
                }
            }
        }).catch(console.error);

        setSessoes(getSessoes());
        try {
            const p = JSON.parse(localStorage.getItem('gymgramps_treino'));
            if (p) setPlano(p);
        } catch (e) { }
    }, []);

    if (!plano || !plano.treinoDia) return <div style={{ padding: '40px', textAlign: 'center' }}>Preencha seu onboarding para gerar seu treino!</div>;

    const diaPadrao = plano.treinoDia[new Date().getDay() % plano.treinoDia.length];
    const dia = diaSelecionado || diaPadrao;
    const jaFeito = getSessoes().some(s => s.data === hojeIsoString() && s.nomeDia === dia.nome);

    const iniciarRegistro = () => {
        setLogExercicios(dia.exercicios.map((ex) => ({
            nomeExercicio: ex.nomeExercicio,
            seriesAlvo: ex.seriesAlvo,
            repsAlvo: ex.repsAlvo,
            series: [],
            observacao: "",
        })));
        setModo('registrar');
    };

    const cancelarRegistro = () => {
        setModo('view');
        setLogExercicios(null);
    };

    const concluirRegistro = async () => {
        const totalSeries = logExercicios.reduce((acc, ex) => acc + ex.series.length, 0);
        if (totalSeries === 0) return;

        const novaSessao = {
            id: crypto.randomUUID(),
            data: hojeIsoString(),
            nomeDia: dia.nome,
            exercicios: logExercicios.map((ex) => ({
                nomeExercicio: ex.nomeExercicio,
                observacao: ex.observacao,
                series: ex.series,
            })),
        };

        const novasSessoes = [novaSessao, ...getSessoes()];
        saveSessoes(novasSessoes);
        setSessoes(novasSessoes);
        
        if (session?.user) {
            await saveUserData(session.user.id, { sessoes: novasSessoes });
        }

        setModo("view");
        setLogExercicios(null);
    };

    const handleAddSerie = (i, carga, reps) => {
        if (!carga || !reps) return;
        const newLog = [...logExercicios];
        `;

let currentContent = fs.readFileSync('c:\\Users\\willy\\OneDrive\\Área de Trabalho\\gymgramps\\frontend\\src\\pages\\Treino.jsx', 'utf-8');
const newContent = correctTopPart + currentContent;
fs.writeFileSync('c:\\Users\\willy\\OneDrive\\Área de Trabalho\\gymgramps\\frontend\\src\\pages\\Treino.jsx', newContent, 'utf-8');
console.log("Treino.jsx completely recovered!");
