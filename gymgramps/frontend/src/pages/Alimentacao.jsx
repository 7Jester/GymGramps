import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons.jsx';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';
import { getSession } from '../js/api/authApi.js';
import { fetchUserData, saveUserData } from '../js/api/dbApi.js';
import foodCatalog from '../../../backend/src/data/food_catalog.json';
import { analyzeNutrition } from '../js/utils/DietAdvisor.js';

const hojeIso = () => new Date().toISOString().split('T')[0];
const getRegistrosDoDia = () => { try { return (JSON.parse(localStorage.getItem('gymgramps_refeicoes')) || []).filter(r => r.data === hojeIso()); } catch { return []; } };
const saveRegistros = (r) => localStorage.setItem('gymgramps_refeicoes', JSON.stringify(r));
const addRegistro = (r) => saveRegistros([...(JSON.parse(localStorage.getItem('gymgramps_refeicoes')) || []), r]);
const removeRegistro = (id) => saveRegistros((JSON.parse(localStorage.getItem('gymgramps_refeicoes')) || []).filter(x => x.id !== id));
const TIPOS_REFEICAO = ["Café da manhã", "Almoço", "Lanche", "Jantar", "Ceia", "Outro"];

export default function Alimentacao() {
    const [mostrandoForm, setMostrandoForm] = useState(true);
    const [session, setSession] = useState(null);
    const [tipoSelecionado, setTipoSelecionado] = useState(TIPOS_REFEICAO[0]);
    const [editandoSugestao, setEditandoSugestao] = useState(null);

    // Autocomplete Tracking States
    const [pesquisa, setPesquisa] = useState('');
    const [sugestoesBusca, setSugestoesBusca] = useState([]);
    const [itensRefeicao, setItensRefeicao] = useState([]);
    const [advisorFbk, setAdvisorFbk] = useState(null);
    const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

    const [registrosHoje, setRegistrosHoje] = useState([]);
    const [plano, setPlano] = useState(null);

    useEffect(() => {
        getSession().then(async (sess) => {
            setSession(sess);
            if (sess?.user) {
                const data = await fetchUserData(sess.user.id);
                if (data?.refeicoes) {
                    localStorage.setItem('gymgramps_refeicoes', JSON.stringify(data.refeicoes));
                    setRegistrosHoje(data.refeicoes.filter(r => r.data === hojeIso()));
                }
                if (data?.dieta) {
                    localStorage.setItem('gymgramps_dieta', JSON.stringify(data.dieta));
                    setPlano(data.dieta);
                }
            }
        }).catch(console.error);

        setRegistrosHoje(getRegistrosDoDia());
        try {
            const p = JSON.parse(localStorage.getItem('gymgramps_dieta'));
            if (p) setPlano(p);
        } catch (e) { }
    }, []);

    useEffect(() => {
        if (pesquisa.trim().length > 1) {
            const result = foodCatalog.filter(f => f.nome.toLowerCase().includes(pesquisa.toLowerCase()));
            setSugestoesBusca(result.slice(0, 5));
        } else {
            setSugestoesBusca([]);
        }
    }, [pesquisa]);

    const handleAddFoodToMeal = (food) => {
        setItensRefeicao([...itensRefeicao, { ...food, quantidade: 1 }]); // Default: 1 porção (100g)
        setPesquisa('');
        setSugestoesBusca([]);
    };

    const handleRemoveFood = (idx) => {
        const newItens = [...itensRefeicao];
        newItens.splice(idx, 1);
        setItensRefeicao(newItens);
    };

    const handleChangeGramatura = (idx, g) => {
        const newItens = [...itensRefeicao];
        newItens[idx].quantidade = Number(g) || 0;
        setItensRefeicao(newItens);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsAnalyzingPhoto(true);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const MAX_WIDTH = 800; // Otimizado de 1024px para 800px para economizar carga de rede na IA Vision
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const base64Data = canvas.toDataURL("image/jpeg", 0.60); // Baixa a qualidade para 60% (redução exponencial de payload)

            fetch('http://localhost:3000/api/nutrition/analyze-dish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: base64Data })
            })
                .then(res => res.json())
                .then(data => {
                    setIsAnalyzingPhoto(false);
                    if (data.is_food === false) {
                        alert("Não conseguimos identificar alimentos nesta imagem. Tente tirar uma foto mais nítida com boa iluminação.");
                        return;
                    }

                    if (data.detected_items && data.detected_items.length > 0) {
                        const mappedItems = data.detected_items.map(item => {
                            const factor = item.estimated_weight_g / 100;
                            return {
                                id: crypto.randomUUID(),
                                nome: item.name + ' ✨', // Marca d'água da IA
                                quantidade: Number(factor.toFixed(2)),
                                // Revertemos os macros por base 100g já que a UI lida com fator 100g internamente
                                calorias: Math.round(item.calories_kcal / factor || 0),
                                proteina: Number((item.protein_g / factor || 0).toFixed(1)),
                                carbo: Number((item.carbohydrates_g / factor || 0).toFixed(1)),
                                gordura: Number((item.fats_g / factor || 0).toFixed(1))
                            };
                        });

                        // Adiciona nativamente permitindo o "Human-in-the-Loop" editar
                        setItensRefeicao(prev => [...prev, ...mappedItems]);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setIsAnalyzingPhoto(false);
                    alert("Ocorreu um erro ao processar a imagem do prato.");
                });
        };
        img.src = URL.createObjectURL(file);
    };

    const handlePrepareEdit = (r, isRegistrado) => {
        setTipoSelecionado(r.nome);
        setEditandoSugestao(r.nome);
        setPesquisa('');

        let textToParse = isRegistrado ? isRegistrado.alimentos : r.itens;
        if (!textToParse) {
            setItensRefeicao([]);
            return;
        }

        const itemsStr = textToParse.split(',').map(s => s.trim()).filter(Boolean);
        const newItens = itemsStr.map((str, idx) => {
            const match = str.match(/(\d+)\s*g\s*(?:de\s*)?(.+)/i);
            let qty = 1;
            let name = str;
            if (match) {
                qty = (parseInt(match[1]) || 100) / 100;
                name = match[2].charAt(0).toUpperCase() + match[2].slice(1);
            }

            // eslint-disable-next-line
            let found = foodCatalog.find(f => f.nome.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(f.nome.toLowerCase()));
            if (!found) {
                found = { id: `mock-${idx}`, nome: name, calorias: 130, proteina: 10, carbo: 15, gordura: 5 };
            }
            return { ...found, quantidade: qty };
        });

        setItensRefeicao(newItens);
    };

    const handleAddRegistro = async () => {
        if (itensRefeicao.length === 0) return;

        // Calcula totais da refeição
        let calRefeicao = 0, proRefeicao = 0, carRefeicao = 0, fatRefeicao = 0;
        let nomesAlimentos = [];

        itensRefeicao.forEach(item => {
            const fator = Number(item.quantidade) || 0;
            calRefeicao += item.calorias * fator;
            proRefeicao += item.proteina * fator;
            carRefeicao += item.carbo * fator;
            fatRefeicao += item.gordura * fator;
            nomesAlimentos.push((fator * 100) + "g " + item.nome);
        });

        const novoReg = {
            id: crypto.randomUUID(),
            data: hojeIso(),
            refeicao: tipoSelecionado,
            alimentos: nomesAlimentos.join(", "),
            calorias: Math.round(calRefeicao),
            macros: { pro: proRefeicao, car: carRefeicao, fat: fatRefeicao },
            origem: "app",
        };

        const todosRegistros = [...(JSON.parse(localStorage.getItem('gymgramps_refeicoes')) || []), novoReg];
        localStorage.setItem('gymgramps_refeicoes', JSON.stringify(todosRegistros));
        if (session?.user) await saveUserData(session.user.id, { refeicoes: todosRegistros });

        const novosHoje = todosRegistros.filter(r => r.data === hojeIso());
        setRegistrosHoje(novosHoje);

        // Avalia o total com o Diet Advisor
        if (plano) {
            const agg = novosHoje.reduce((acc, cr) => {
                acc.calorias += cr.calorias || 0;
                acc.proteinaG += cr.macros?.pro || 0;
                acc.carboG += cr.macros?.car || 0;
                acc.gorduraG += cr.macros?.fat || 0;
                return acc;
            }, { calorias: 0, proteinaG: 0, carboG: 0, gorduraG: 0 });

            const fbk = analyzeNutrition(agg, plano);
            setAdvisorFbk(fbk);
        }

        setMostrandoForm(false);
        setEditandoSugestao(null);
        setItensRefeicao([]);
    };

    const handleCopiarSugestao = async (sugestaoPlano) => {
        // Mock rápido para preencher com algo realista e salvar
        const novoReg = {
            id: crypto.randomUUID(),
            data: hojeIso(),
            refeicao: sugestaoPlano.nome,
            alimentos: sugestaoPlano.itens,
            calorias: sugestaoPlano.calorias || 0,
            macros: { pro: plano.macros.proteinaG / 4, car: plano.macros.carboG / 4, fat: plano.macros.gorduraG / 4 }, // divisoes mocadas pra teste
            origem: "suggestion",
        };
        const todosRegistros = [...(JSON.parse(localStorage.getItem('gymgramps_refeicoes')) || []), novoReg];
        localStorage.setItem('gymgramps_refeicoes', JSON.stringify(todosRegistros));
        if (session?.user) await saveUserData(session.user.id, { refeicoes: todosRegistros });

        setRegistrosHoje(todosRegistros.filter(r => r.data === hojeIso()));
    };

    const handleRemoveRegistro = async (id) => {
        const todosRegistros = (JSON.parse(localStorage.getItem('gymgramps_refeicoes')) || []).filter(x => x.id !== id);
        localStorage.setItem('gymgramps_refeicoes', JSON.stringify(todosRegistros));
        if (session?.user) await saveUserData(session.user.id, { refeicoes: todosRegistros });
        setRegistrosHoje(todosRegistros.filter(r => r.data === hojeIso()));
    };

    const consumidas = registrosHoje.reduce((acc, r) => acc + (r.calorias || 0), 0);
    const proConsumidas = registrosHoje.reduce((acc, r) => acc + (r.macros?.pro || 0), 0);
    const carConsumidas = registrosHoje.reduce((acc, r) => acc + (r.macros?.car || 0), 0);
    const fatConsumidas = registrosHoje.reduce((acc, r) => acc + (r.macros?.fat || 0), 0);

    const pctReal = plano ? Math.round((consumidas / plano.metaCalorica) * 100) : 0;
    const pct = Math.min(100, pctReal);

    if (!plano || !plano.metaCalorica || !plano.refeicoes) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ marginBottom: '16px' }}>Houve um problema na geração da sua dieta ou ela está incompleta.</p>
            <button className="btn-block" onClick={() => window.location.href = '/onboarding'}>Refazer Onboarding</button>
        </div>
    );

    return (
        <>
            <Header />
            <main className="wrap">
                <section className="screen" id="dieta">
                    <div className="page-head">
                        <div className="eyebrow">Alimentação</div>
                        <h1>Sua dieta</h1>
                    </div>

                    {advisorFbk && (
                        <div style={{
                            marginBottom: '20px', padding: '16px', borderRadius: '12px',
                            background: advisorFbk.type === 'danger' ? 'rgba(239,68,68, 0.1)' : advisorFbk.type === 'warning' ? 'rgba(234,179,8, 0.1)' : 'rgba(163,230,53, 0.1)',
                            border: "1px solid " + (advisorFbk.type === 'danger' ? 'rgba(239,68,68, 0.3)' : advisorFbk.type === 'warning' ? 'rgba(234,179,8, 0.3)' : 'rgba(163,230,53, 0.3)'),
                            color: advisorFbk.type === 'danger' ? '#f87171' : advisorFbk.type === 'warning' ? '#facc15' : 'var(--lime)',
                            display: 'flex', gap: '12px', alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '24px' }}>{advisorFbk.type === 'danger' ? '🚨' : advisorFbk.type === 'warning' ? '⚠️' : '💪'}</span>
                            <span style={{ fontSize: '14px', lineHeight: '1.4', fontWeight: '500' }}>{advisorFbk.message}</span>
                        </div>
                    )}

                    <div className="card" style={{ borderRadius: 'var(--r-lg)', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <div className="eyebrow" style={{ color: 'var(--ink-muted)' }}>CONSUMIDO</div>
                                <div style={{ fontFamily: 'var(--font-display)', marginTop: '8px' }}>
                                    <span style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-1.5px', color: 'var(--ink)', marginRight: '6px' }}>{consumidas}</span>
                                    <span style={{ fontSize: '18px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>/ {plano.metaCalorica || 0} kcal</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="eyebrow" style={{ color: 'var(--ink-muted)' }}>FALTAM</div>
                                <div style={{ fontSize: '28px', fontWeight: '800', color: Math.max(0, plano.metaCalorica - consumidas) === 0 ? 'var(--brand)' : 'var(--lime)', marginTop: '4px', letterSpacing: '-0.5px' }}>
                                    {Math.max(0, plano.metaCalorica - consumidas)} kcal
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--line)', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand)', borderRadius: '6px' }}></div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--brand)' }}></div> Registrado</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--lime)' }}></div> Ainda no plano · {Math.round(plano.refeicoes.filter(r => !registrosHoje.find(reg => reg.refeicao === r.nome)).reduce((acc, r) => acc + r.calorias, 0))} kcal</div>
                        </div>

                        <div className="grid-3" style={{ gap: '24px' }}>
                            <div>
                                <div className="eyebrow" style={{ marginBottom: '8px', color: 'var(--ink-muted)' }}>PROTEÍNA</div>
                                <div style={{ marginBottom: '12px', fontFamily: 'var(--font-display)' }}>
                                    <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)' }}>{Math.round(proConsumidas)}</span>
                                    <span style={{ fontSize: '14px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', marginLeft: '4px' }}>/ {plano.macros?.proteinaG || 0} g</span>
                                </div>
                                <div style={{ background: 'var(--line)', height: '4px', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                                    <div style={{ height: '100%', background: 'var(--brand)', width: `${Math.min(100, Math.round((proConsumidas / (plano.macros?.proteinaG || 1)) * 100))}%` }}></div>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--brand)' }}>{(plano.macros?.proteinaG - proConsumidas) <= 0 ? 'meta batida' : `faltam ${Math.round(plano.macros?.proteinaG - proConsumidas)} g`}</div>
                            </div>
                            <div>
                                <div className="eyebrow" style={{ marginBottom: '8px', color: 'var(--ink-muted)' }}>CARBOIDRATO</div>
                                <div style={{ marginBottom: '12px', fontFamily: 'var(--font-display)' }}>
                                    <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)' }}>{Math.round(carConsumidas)}</span>
                                    <span style={{ fontSize: '14px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', marginLeft: '4px' }}>/ {plano.macros?.carboG || 0} g</span>
                                </div>
                                <div style={{ background: 'var(--line)', height: '4px', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                                    <div style={{ height: '100%', background: 'var(--lime)', width: `${Math.min(100, Math.round((carConsumidas / (plano.macros?.carboG || 1)) * 100))}%` }}></div>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{(plano.macros?.carboG - carConsumidas) <= 0 ? 'meta batida' : `faltam ${Math.round(plano.macros?.carboG - carConsumidas)} g`}</div>
                            </div>
                            <div>
                                <div className="eyebrow" style={{ marginBottom: '8px', color: 'var(--ink-muted)' }}>GORDURA</div>
                                <div style={{ marginBottom: '12px', fontFamily: 'var(--font-display)' }}>
                                    <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)' }}>{Math.round(fatConsumidas)}</span>
                                    <span style={{ fontSize: '14px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', marginLeft: '4px' }}>/ {plano.macros?.gorduraG || 0} g</span>
                                </div>
                                <div style={{ background: 'var(--line)', height: '4px', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                                    <div style={{ height: '100%', background: 'var(--accent)', width: `${Math.min(100, Math.round((fatConsumidas / (plano.macros?.gorduraG || 1)) * 100))}%` }}></div>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--lime)' }}>{(plano.macros?.gorduraG - fatConsumidas) <= 0 ? 'meta batida' : `faltam ${Math.round(plano.macros?.gorduraG - fatConsumidas)} g`}</div>
                            </div>
                        </div>
                    </div>

                    {consumidas >= plano.metaCalorica && (
                        <div style={{ marginTop: '24px', background: 'var(--brand)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--brand-on)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--lime)', display: 'grid', placeItems: 'center', color: 'var(--brand)', flexShrink: 0 }}>
                                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div>
                                    <div className="eyebrow" style={{ color: 'var(--lime)', marginBottom: '8px', letterSpacing: '0.1em' }}>META DO DIA BATIDA</div>
                                    <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>Parabéns — você fechou {pctReal}% da sua meta hoje.</h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{consumidas} de {plano.metaCalorica} kcal e {Math.round(proConsumidas)} g de proteína. Se ainda for comer, prefira algo leve.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '24px', marginLeft: '24px', minWidth: '90px' }}>
                                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--lime)', lineHeight: '1' }}>+6</div>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginTop: '6px', letterSpacing: '1px' }}>GG NA LIGA</div>
                            </div>
                        </div>
                    )}

                    {!mostrandoForm && (
                        <div className="section-head" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Diário de hoje</h3>
                            <button type="button" onClick={() => setMostrandoForm(true)} style={{
                                background: 'transparent',
                                color: 'var(--ink)',
                                border: '1px solid var(--line)',
                                padding: '8px 16px',
                                borderRadius: '24px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Adicionar refeição
                            </button>
                        </div>
                    )}

                    {mostrandoForm && (
                        <div className="rm" id="registrarRefeicao" style={{ marginBottom: '24px', marginTop: '32px' }}>
                            <div className="rm-head">
                                <div>
                                    <h2>Registrar refeição</h2>
                                    <p>Gramas e macros calculados na hora.</p>
                                </div>
                                <button type="button" className="rm-close" onClick={() => setMostrandoForm(false)}>
                                    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
                                    Fechar
                                </button>
                            </div>

                            <div className="rm-block">
                                <div className="rm-eyebrow rm-block-label">Qual refeição</div>
                                <div className="rm-meals">
                                    {TIPOS_REFEICAO.map(tipo => (
                                        <button
                                            key={tipo}
                                            type="button"
                                            className="rm-meal"
                                            aria-pressed={tipo === tipoSelecionado}
                                            onClick={() => setTipoSelecionado(tipo)}
                                        >
                                            {tipo}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="rm-cols">
                                <div className="rm-ai">
                                    <div className="rm-ai-top">
                                        <span className="rm-eyebrow">Reconhecimento por foto</span>
                                        <span className="rm-pro">Pro</span>
                                    </div>
                                    <div className="rm-ai-body">
                                        <div className="rm-ai-icon">
                                            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                                                <rect x="2.5" y="6" width="19" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                                <path d="M8.5 6l1.4-2.2h4.2L15.5 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                                <circle cx="12" cy="13" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3>Fotografe o prato</h3>
                                            <p>A IA identifica os alimentos, estima as gramas e preenche os macros. Você confere antes de salvar.</p>
                                        </div>
                                    </div>

                                    {localStorage.getItem('gymgramps_is_pro') !== 'true' ? (
                                        <button type="button" className="rm-scan" onClick={() => alert('Assine o plano PRO para desbloquear a Câmera Lente Inteligente!')}>Conheça o PRO</button>
                                    ) : (
                                        <label className="rm-scan" style={{ display: 'block', textAlign: 'center' }}>
                                            Abrir câmera
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isAnalyzingPhoto} style={{ display: 'none' }} />
                                        </label>
                                    )}
                                    {isAnalyzingPhoto && (
                                        <div className="rm-scanning" style={{ display: 'flex' }}><span className="rm-dot"></span>Analisando a imagem</div>
                                    )}
                                </div>

                                <div className="rm-search">
                                    <div className="rm-eyebrow" style={{ marginBottom: '14px' }}>Catálogo manual</div>
                                    <label className="rm-field">
                                        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="6.8" cy="6.8" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M10.4 10.4L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                                        <input type="search" placeholder="Arroz, frango, ovo…" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} aria-label="Buscar alimento" />
                                    </label>
                                    <div className="rm-results">
                                        {sugestoesBusca.length > 0 ? sugestoesBusca.map(f => (
                                            <button key={f.id} type="button" className="rm-result" onClick={() => handleAddFoodToMeal(f)}>
                                                <span><b>{f.nome}</b><small>C {f.carbo} · P {f.proteina} · G {f.gordura} por 100 g</small></span>
                                                <i>{Math.round(f.calorias)} kcal</i>
                                                <span className="rm-plus">+</span>
                                            </button>
                                        )) : (
                                            pesquisa.length > 1 && <div className="rm-none">Nada encontrado para "{pesquisa}".</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="rm-items-head">
                                <span className="rm-eyebrow">Nesta refeição</span>
                                {itensRefeicao.length > 0 && (
                                    <button type="button" className="rm-clear" onClick={() => setItensRefeicao([])}>Limpar tudo</button>
                                )}
                            </div>
                            <div>
                                {!itensRefeicao.length ? (
                                    <div className="rm-empty"><b>Nenhum item ainda</b><small>Fotografe o prato ou busque no catálogo para começar.</small></div>
                                ) : (
                                    <div className="rm-items">
                                        {itensRefeicao.map((item, idx) => (
                                            <div className="rm-item" key={idx}>
                                                <div>
                                                    <div className="rm-item-name">
                                                        <b>{item.nome}</b>
                                                    </div>
                                                    <small>C {Math.round(item.carbo * item.quantidade)} · P {Math.round(item.proteina * item.quantidade)} · G {Math.round(item.gordura * item.quantidade)}</small>
                                                </div>
                                                <div className="rm-stepper">
                                                    <button type="button" onClick={() => handleChangeGramatura(idx, Math.max(0.1, ((item.quantidade * 100) - 10) / 100))} aria-label="Menos 10 gramas">−</button>
                                                    <span>{Math.round(item.quantidade * 100)} g</span>
                                                    <button type="button" onClick={() => handleChangeGramatura(idx, ((item.quantidade * 100) + 10) / 100)} aria-label="Mais 10 gramas">+</button>
                                                </div>
                                                <div className="rm-item-kcal">{Math.round(item.calorias * item.quantidade)} kcal</div>
                                                <button type="button" className="rm-remove" onClick={() => handleRemoveFood(idx)} aria-label={"Remover " + item.nome}>
                                                    <svg viewBox="0 0 12 12" width="9" height="9" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="rm-foot">
                                <div className="rm-totals">
                                    <div>
                                        <div className="rm-total-label">Total da refeição</div>
                                        <div className="rm-total-value">
                                            <b>{Math.round(itensRefeicao.reduce((acc, it) => acc + (it.calorias * it.quantidade), 0))}</b>
                                            <span>kcal</span>
                                        </div>
                                    </div>
                                    <div className="rm-macros">
                                        <div><div className="rm-total-label">Carb</div><strong>{Math.round(itensRefeicao.reduce((acc, it) => acc + (it.carbo * it.quantidade), 0))} g</strong></div>
                                        <div><div className="rm-total-label">Prot</div><strong>{Math.round(itensRefeicao.reduce((acc, it) => acc + (it.proteina * it.quantidade), 0))} g</strong></div>
                                        <div><div className="rm-total-label">Gord</div><strong>{Math.round(itensRefeicao.reduce((acc, it) => acc + (it.gordura * it.quantidade), 0))} g</strong></div>
                                    </div>
                                </div>
                                <div className="rm-actions">
                                    <span className="rm-hint">{itensRefeicao.length} itens</span>
                                    <button type="button" className="rm-save" disabled={itensRefeicao.length === 0} onClick={handleAddRegistro}>Salvar refeição</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card card-flush">
                        {registrosHoje.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '13px' }}>Nenhuma refeição rastreada de forma autônoma.</div>
                        ) : registrosHoje.map((r) => (
                            <div key={r.id} className="row row-meal-log">
                                <div className="time">{r.refeicao}</div>
                                <div>
                                    <div className="sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 0 }}>{r.alimentos}</div>
                                </div>
                                <div className="kcal">{r.calorias} kcal</div>
                                <div className="chev" style={{ color: 'var(--danger)', cursor: 'pointer', textAlign: 'center' }} onClick={() => handleRemoveRegistro(r.id)}>×</div>
                            </div>
                        ))}
                    </div>

                    <div className="section-head" style={{ marginTop: '24px' }}>
                        <h3>Sugestão do seu nutricionista online</h3>
                    </div>

                    <div style={{ marginTop: '24px', position: 'relative' }}>
                        {(plano.refeicoes || []).map((r, i) => {
                            const isRegistrado = registrosHoje.find(reg => reg.refeicao === r.nome);
                            const isNext = !isRegistrado && plano.refeicoes.findIndex(re => !registrosHoje.find(reg => reg.refeicao === re.nome)) === i;
                            const isLast = i === plano.refeicoes.length - 1;

                            return (
                                <div key={i} style={{ display: 'flex', gap: '24px', marginBottom: isLast ? '0' : '20px', position: 'relative' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', position: 'relative', marginTop: '16px' }}>
                                        <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--ink)', lineHeight: '1' }}>{r.horario}</div>
                                        {isRegistrado && <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>feito {r.horario}</div>}

                                        {!isLast && <div style={{ position: 'absolute', top: '24px', bottom: '-40px', right: '-12px', borderRight: '1px solid var(--line)' }}></div>}

                                        <div style={{
                                            position: 'absolute',
                                            top: '0px',
                                            right: '-20px',
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            background: isRegistrado ? 'var(--brand)' : 'var(--bg)',
                                            border: isRegistrado ? 'none' : '2px solid var(--brand)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--lime)',
                                            zIndex: 2
                                        }}>
                                            {isRegistrado && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        {editandoSugestao === r.nome ? (
                                            <div>
                                                <div style={{ background: 'var(--brand)', borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', color: 'var(--brand-on)' }}>
                                                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M8 10V8a4 4 0 0 1 8 0v2"></path><circle cx="12" cy="16" r="2"></circle></svg>
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: 'var(--brand-on)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                Fotografar o prato <span style={{ background: 'var(--lime)', color: 'var(--brand)', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>PRO</span>
                                                            </h4>
                                                            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>A IA identifica os alimentos e estima as gramas.</p>
                                                        </div>
                                                    </div>
                                                    {localStorage.getItem('gymgramps_is_pro') !== 'true' ? (
                                                        <button type="button" onClick={() => alert('Assine o plano PRO para desbloquear a Câmera Lente Inteligente!')} style={{ background: 'var(--lime)', color: 'var(--brand)', border: 'none', padding: '12px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Abrir câmera</button>
                                                    ) : (
                                                        <label style={{ cursor: 'pointer', background: 'var(--lime)', color: 'var(--brand)', padding: '12px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: '700' }}>
                                                            {isAnalyzingPhoto ? 'Analisando...' : 'Abrir câmera'}
                                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isAnalyzingPhoto} style={{ display: 'none' }} />
                                                        </label>
                                                    )}
                                                </div>

                                                <div style={{ marginBottom: '12px', padding: '0 8px' }}>
                                                    <span className="eyebrow" style={{ color: 'var(--ink-muted)' }}>O QUE VOCÊ COMEU</span>
                                                </div>
                                                <div className="card" style={{ padding: '0', borderRadius: '16px', border: '1px solid var(--line)', background: 'var(--surface)', overflow: 'hidden' }}>
                                                    {!itensRefeicao.length ? (
                                                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '14px' }}>Nenhum alimento adicionado.</div>
                                                    ) : (
                                                        <div>
                                                            {itensRefeicao.map((item, idx) => (
                                                                <div key={idx} style={{
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                    padding: '16px 20px',
                                                                    borderBottom: idx < itensRefeicao.length - 1 ? '1px solid var(--line-faint)' : 'none'
                                                                }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--ink)', marginBottom: '4px' }}>{item.nome}</div>
                                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                                                            P {Math.round(item.proteina * item.quantidade)} · C {Math.round(item.carbo * item.quantidade)} · G {Math.round(item.gordura * item.quantidade)}
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                                        <div style={{
                                                                            display: 'flex', alignItems: 'center',
                                                                            border: '1px solid var(--line)', borderRadius: '24px',
                                                                            padding: '4px 8px', background: 'var(--surface-2)',
                                                                            fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '600', color: 'var(--ink)'
                                                                        }}>
                                                                            <button type="button" onClick={() => handleChangeGramatura(idx, Math.max(0.1, ((item.quantidade * 100) - 10) / 100))} style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center' }}>−</button>
                                                                            <span style={{ minWidth: '44px', textAlign: 'center' }}>{Math.round(item.quantidade * 100)} <span style={{ color: 'var(--ink-muted)' }}>g</span></span>
                                                                            <button type="button" onClick={() => handleChangeGramatura(idx, ((item.quantidade * 100) + 10) / 100)} style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center' }}>+</button>
                                                                        </div>
                                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '700', color: 'var(--ink)', minWidth: '70px', textAlign: 'right' }}>
                                                                            {Math.round(item.calorias * item.quantidade)} <span style={{ fontWeight: '600' }}>kcal</span>
                                                                        </div>
                                                                        <button type="button" onClick={() => handleRemoveFood(idx)} style={{
                                                                            width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--line)', background: 'transparent',
                                                                            color: 'var(--ink-faint)', display: 'grid', placeItems: 'center', cursor: 'pointer', marginLeft: '4px'
                                                                        }}>
                                                                            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" /></svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ padding: '0', marginTop: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid var(--line)', borderRadius: '12px', padding: '0 16px' }}>
                                                        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" style={{ color: 'var(--ink-faint)' }}><circle cx="6.8" cy="6.8" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M10.4 10.4L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                                                        <input
                                                            type="search"
                                                            placeholder="Adicionar alimento..."
                                                            value={pesquisa}
                                                            onChange={(e) => setPesquisa(e.target.value)}
                                                            style={{ flex: 1, background: 'none', border: 'none', padding: '16px 12px', fontSize: '15px', color: 'var(--ink)', outline: 'none' }}
                                                        />
                                                    </div>

                                                    {sugestoesBusca.length > 0 ? (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
                                                            {sugestoesBusca.map(f => (
                                                                <button key={f.id} type="button" onClick={() => handleAddFoodToMeal(f)} style={{
                                                                    background: 'transparent', border: '1px solid var(--line)', borderRadius: '24px',
                                                                    padding: '8px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--ink-soft)',
                                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                                                }}>
                                                                    <span style={{ color: 'var(--accent)', fontSize: '14px', lineHeight: '1' }}>+</span> {f.nome}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        pesquisa.length > 1 && <div style={{ marginTop: '16px', color: 'var(--ink-muted)', fontSize: '14px' }}>Nada encontrado para "{pesquisa}".</div>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 0 20px' }}>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--ink-muted)' }}>
                                                        Total <strong style={{ color: 'var(--ink)', fontSize: '17px', margin: '0 4px' }}>{Math.round(itensRefeicao.reduce((acc, it) => acc + (it.calorias * it.quantidade), 0))} kcal</strong>
                                                        <span style={{ margin: '0 8px' }}>·</span>
                                                        <span style={{ color: 'var(--accent)' }}>dentro do plano</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button type="button" onClick={() => setEditandoSugestao(null)} style={{
                                                            background: 'transparent', border: '1px solid var(--line)', borderRadius: '24px', padding: '12px 24px',
                                                            fontSize: '14px', fontWeight: '700', color: 'var(--ink)', cursor: 'pointer'
                                                        }}>Cancelar</button>
                                                        <button type="button" disabled={itensRefeicao.length === 0} onClick={handleAddRegistro} style={{
                                                            background: 'var(--brand)', border: 'none', borderRadius: '24px', padding: '12px 24px',
                                                            fontSize: '14px', fontWeight: '700', color: 'var(--brand-on)', cursor: 'pointer', opacity: itensRefeicao.length === 0 ? 0.6 : 1
                                                        }}>Salvar refeição</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{
                                                background: 'var(--surface)',
                                                border: '1px solid var(--line)',
                                                borderRadius: '16px',
                                                padding: '20px 24px',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>{r.nome}</h4>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: '700',
                                                            letterSpacing: '0.5px',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            background: isRegistrado ? 'var(--brand)' : (isNext ? 'var(--lime)' : 'var(--line)'),
                                                            color: isRegistrado ? 'var(--lime)' : 'var(--ink)',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {isRegistrado ? 'Registrado' : (isNext ? 'Próxima' : 'Pendente')}
                                                        </span>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '16px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--ink)' }}>{Math.round(r.calorias)} kcal</div>
                                                        {isRegistrado && <div style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>como planejado</div>}
                                                    </div>
                                                </div>

                                                <p style={{ margin: '0 0 20px', fontSize: '14.5px', color: 'var(--ink-muted)', lineHeight: '1.5' }}>{r.itens}</p>

                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                    {isRegistrado ? (
                                                        <>
                                                            <button type="button" onClick={() => handlePrepareEdit(r, isRegistrado)} style={{
                                                                background: 'none', border: 'none', color: 'var(--accent)', fontSize: '14px', fontWeight: '700',
                                                                textDecoration: 'underline', cursor: 'pointer', padding: 0
                                                            }}>Editar</button>
                                                            <button type="button" onClick={() => handleRemoveRegistro(isRegistrado.id)} style={{
                                                                background: 'none', border: 'none', color: 'var(--ink-muted)', fontSize: '14px', fontWeight: '700',
                                                                textDecoration: 'underline', cursor: 'pointer', padding: 0
                                                            }}>Desfazer</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button type="button" onClick={() => handleCopiarSugestao(r)} style={{
                                                                background: 'var(--brand)', color: 'var(--brand-on)', border: 'none', padding: '12px 24px',
                                                                borderRadius: '24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                                                            }}>Registrar como está</button>
                                                            <button type="button" onClick={() => handlePrepareEdit(r, false)} style={{
                                                                background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', padding: '12px 24px',
                                                                borderRadius: '24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                                                            }}>Ajustar</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <p className="note">
                        Alerta Médico Científico: Sugestão baseada na Equação de Harris-Benedict (Basal). Não substitui nutricionista.
                    </p>
                </section >
            </main >
            <Footer />
        </>
    );
}
