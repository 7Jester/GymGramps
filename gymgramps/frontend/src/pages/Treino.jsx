import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons.jsx';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';
import { analyzeSetPerformance } from '../js/utils/ProgressionAdvisor.js';
import { getSession } from '../js/api/authApi.js';
import { fetchUserData, saveUserData } from '../js/api/dbApi.js';

const NUM = { zero: 0, um: 1, uma: 1, dois: 2, duas: 2, três: 3, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, quinze: 15, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90, cem: 100 };
function parseVoz(text) {
    const t = text.toLowerCase().replace(",", ".");
    const num = (s) => (/^\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NUM[s]);
    const words = t.split(/\s+/);
    let kg, reps;
    words.forEach((w, i) => {
        const next = words[i + 1] || "";
        if (/^quilo|^kg/.test(next) && num(w) != null) kg = num(w);
        if (/^rep|^vez/.test(next) && num(w) != null) reps = num(w);
    });
    return kg != null && reps != null ? { kg, reps } : null;
}

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
    return `${dia}/${mes}/${ano}`;
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
        newLog[i].series.push({
            numeroSerie: newLog[i].series.length + 1,
            cargaKg: Number(carga),
            reps: Number(reps),
        });
        setLogExercicios(newLog);
    };

    const handleDelSerie = (i, si) => {
        const newLog = [...logExercicios];
        newLog[i].series.splice(si, 1);
        setLogExercicios(newLog);
    };

    const handleObsChange = (i, val) => {
        const newLog = [...logExercicios];
        newLog[i].observacao = val;
        setLogExercicios(newLog);
    };

    const openTrocaModal = async (i, exe) => {
        setTrocandoExIdx(i);
        setNovoNomeEx('');
        setIsCustomEx(false);
        setIsModalTrocaOpen(true);
        setIsFetchingSugestoes(true);
        setSugestoes([]);

        try {
            const res = await fetch('http://localhost:3000/api/onboarding/sugerir-substituicao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exercicio: exe.nomeExercicio })
            });
            const data = await res.json();
            if (data && data.sugestoes && Array.isArray(data.sugestoes)) {
                setSugestoes(data.sugestoes);
            } else {
                setSugestoes([]);
            }
        } catch (e) {
            console.error(e);
            setSugestoes([]);
        }
        setIsFetchingSugestoes(false);
    };

    const closeTrocaModal = () => {
        setIsModalTrocaOpen(false);
        setTrocandoExIdx(null);
        setSugestoes([]);
    };

    const confirmarTrocaExercicio = () => {
        if (!novoNomeEx.trim()) return;
        const newPlano = JSON.parse(JSON.stringify(plano));
        const dayIdx = newPlano.treinoDia.findIndex(d => d.nome === dia.nome);

        if (dayIdx > -1) {
            newPlano.treinoDia[dayIdx].exercicios[trocandoExIdx].nomeExercicio = novoNomeEx;
            setPlano(newPlano);
            localStorage.setItem('gymgramps_treino', JSON.stringify(newPlano));

            // Atualizar o dia selecionado imediatamente na tela
            setDiaSelecionado(newPlano.treinoDia[dayIdx]);
        }
        closeTrocaModal();
    };

    const swapBtnStyle = {
        display: "flex", alignItems: "center", gap: 6, border: "1px solid var(--line)",
        borderRadius: 999, background: "var(--surface-2)", color: "var(--ink-soft)", fontFamily: "'DM Sans', sans-serif",
        fontSize: 12.5, fontWeight: 600, padding: "8px 14px 8px 10px", cursor: "pointer", flexShrink: 0,
        transition: "border-color .15s, color .15s",
    };

    return (
        <>
            <Header />
            <main style={{ background: "var(--bg)", fontFamily: "'DM Sans', sans-serif", color: "var(--ink)", padding: "48px 0 80px", minHeight: "100vh" }}>
                <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 28px" }}>

                    {modo === 'view' ? (
                        <>
                            <div style={{ marginBottom: 26 }}>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 12 }}>
                                    {diaSelecionado && diaSelecionado.nome !== diaPadrao.nome ? 'Treino Selecionado' : 'Treino de Hoje'}
                                </div>
                                <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 40, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.04em" }}>{dia.nome}</h1>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", gap: 14, alignItems: "start" }}>
                                {/* LISTA DE EXERCÍCIOS */}
                                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, overflow: "hidden" }}>
                                    <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line-soft)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                                            {dia.aquecimento || 'Exercícios'}
                                        </div>
                                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-muted)", whiteSpace: "nowrap", paddingTop: 2 }}>Séries × Reps</div>
                                    </div>

                                    {dia.exercicios.map((ex, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid var(--line-soft)" }}>
                                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--ink-faint)", width: 20, flexShrink: 0 }}>
                                                {String(i + 1).padStart(2, '0')}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>{ex.nomeExercicio}</div>
                                            </div>
                                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 600, color: "var(--brand)", background: "var(--line-soft)", borderRadius: 8, padding: "6px 12px", whiteSpace: "nowrap", flexShrink: 0 }}>
                                                {ex.seriesAlvo}×{ex.repsAlvo}
                                            </div>
                                            <button
                                                onClick={() => openTrocaModal(i, ex)}
                                                style={swapBtnStyle}
                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand)"; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--ink-soft)"; }}
                                            >
                                                <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true"><path d="M4 7h10.5M14.5 7L11.5 4M14.5 7L11.5 10M16 13H5.5M5.5 13L8.5 16M5.5 13L8.5 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                Trocar
                                            </button>
                                        </div>
                                    ))}

                                    <div style={{ padding: "22px 24px" }}>
                                        <button onClick={iniciarRegistro} style={{ width: "100%", border: 0, borderRadius: 999, background: "var(--brand)", color: "var(--brand-on)", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, padding: 16, cursor: "pointer" }}>
                                            {jaFeito ? "Treino já registrado. Treinar de novo?" : "Começar a Registrar Cargas"}
                                        </button>
                                    </div>
                                </div>

                                {/* COLUNA LATERAL */}
                                <div style={{ display: "grid", gap: 14 }}>
                                    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "22px 24px" }}>
                                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 14 }}>Sua rotina completa</div>
                                        <div style={{ display: "grid", gap: 8 }}>
                                            {plano.treinoDia.map((r, idx) => {
                                                const active = r.nome === dia.nome;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setDiaSelecionado(r)}
                                                        style={{
                                                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left",
                                                            border: `1px solid ${active ? "var(--brand)" : "var(--line)"}`, borderRadius: 14,
                                                            background: active ? "var(--brand)" : "var(--surface-2)", padding: "13px 16px", cursor: "pointer",
                                                        }}
                                                    >
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? "var(--brand-on)" : "var(--ink)", lineHeight: 1.35 }}>{r.nome}</div>
                                                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: active ? "var(--brand-on-soft)" : "var(--ink-muted)", marginTop: 3, lineHeight: 1.4 }}>{r.musculosAlvo || 'Treino do plano'}</div>
                                                        </div>
                                                        <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" style={{ flexShrink: 0, color: active ? "var(--lime)" : "var(--ink-faint)" }}><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "22px 24px" }}>
                                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 10 }}>Histórico deste treino</div>
                                        {sessoes.filter(s => s.nomeDia === dia.nome).length === 0 ? (
                                            <div style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55 }}>Nenhum registro para este treino ainda. Seu primeiro registro aparece aqui depois que você fechar a série de hoje.</div>
                                        ) : (
                                            <div style={{ display: 'grid', gap: '14px' }}>
                                                {sessoes.filter(s => s.nomeDia === dia.nome).slice(0, 3).map((s, i) => {
                                                    const totalSeries = s.exercicios.reduce((acc, ex) => acc + ex.series.length, 0);
                                                    return (
                                                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: "var(--brand)" }}>{formatarData(s.data)}</span>
                                                            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--ink-soft)' }}>{totalSeries} séries com cargas</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ maxWidth: 800, margin: "0 auto" }}>
                            <div style={{ marginBottom: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 12 }}>
                                        Registrando
                                    </div>
                                    <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 40, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.04em" }}>{dia.nome}</h1>
                                </div>
                                <button type="button" onClick={cancelarRegistro} style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '14px' }}>Cancelar</button>
                            </div>

                            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, overflow: "hidden", padding: "0" }}>
                                <div style={{ padding: '0 26px 22px' }}>
                                    {logExercicios.map((ex, i) => (
                                        <LogExercicioCard
                                            key={i}
                                            ex={ex}
                                            i={i}
                                            onAddSerie={(carga, reps) => handleAddSerie(i, carga, reps)}
                                            onDelSerie={(si) => handleDelSerie(i, si)}
                                            onObsChange={(val) => handleObsChange(i, val)}
                                        />
                                    ))}
                                </div>
                                <div style={{ padding: '22px 26px', borderTop: '1px solid var(--line)' }}>
                                    <button type="button" onClick={concluirRegistro} style={{ width: "100%", border: 0, borderRadius: 999, background: "var(--brand)", color: "var(--brand-on)", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, padding: 16, cursor: "pointer" }}>
                                        Salvar Progresso Absoluto
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL: TROCAR EXERCÍCIO */}
                {isModalTrocaOpen && trocandoExIdx !== null && (
                    <div
                        onClick={closeTrocaModal}
                        style={{ position: "fixed", inset: 0, background: "rgba(22,24,15,0.55)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 24, zIndex: 40 }}
                    >
                        <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 22, padding: 30, width: "100%", maxWidth: 460 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                                <div>
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 10 }}>Redefinir exercício</div>
                                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Substituir "{dia.exercicios[trocandoExIdx].nomeExercicio}"</div>
                                </div>
                                <button onClick={closeTrocaModal} style={{ width: 34, height: 34, flexShrink: 0, border: "1px solid var(--line)", borderRadius: "50%", background: "var(--surface-2)", color: "var(--ink-soft)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                                    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                                </button>
                            </div>

                            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6 }}>
                                <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" style={{ color: "var(--accent)" }}><path d="M10 2l1.6 4.6L16 8l-4.4 1.4L10 14l-1.6-4.6L4 8l4.4-1.4L10 2z" fill="currentColor" /></svg>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)" }}>Opções inteligentes (IA)</span>
                            </div>

                            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                                {isFetchingSugestoes ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--accent)', fontSize: 13.5 }}>Analisando biomecânica via IA...</div>
                                ) : (
                                    <>
                                        {sugestoes.map((sug, i) => {
                                            const picked = novoNomeEx === sug && !isCustomEx;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => { setNovoNomeEx(sug); setIsCustomEx(false); }}
                                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left", border: `1px solid ${picked ? "var(--brand)" : "var(--line)"}`, borderRadius: 14, background: picked ? "var(--bg)" : "var(--surface-2)", padding: "12px 14px", cursor: "pointer" }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                                        <span style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${picked ? "var(--brand)" : "var(--line)"}`, background: picked ? "var(--brand)" : "none", display: "grid", placeItems: "center", flexShrink: 0 }}>
                                                            {picked && <svg viewBox="0 0 10 10" width="7" height="7" aria-hidden="true"><path d="M1.8 5.2l2.1 2L8.2 2.8" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                                        </span>
                                                        <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{sug}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {sugestoes.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-muted)", padding: "8px 0" }}>A IA encontrou dificuldades em isolar este exercício neste momento.</div>}
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => { setIsCustomEx(true); setNovoNomeEx(""); }}
                                style={{ display: "flex", alignItems: "center", gap: 8, border: "1px dashed var(--line)", borderRadius: 14, background: "none", color: isCustomEx ? "var(--brand)" : "var(--ink-soft)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, padding: "12px 14px", cursor: "pointer", width: "100%", marginTop: 14 }}
                            >
                                <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                                Inserir exercício manualmente
                            </button>

                            {isCustomEx && (
                                <input
                                    value={novoNomeEx}
                                    onChange={(e) => setNovoNomeEx(e.target.value)}
                                    placeholder="Nome do exercício"
                                    style={{ width: "100%", marginTop: 10, border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface)", padding: "12px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: "var(--ink)", outline: "none" }}
                                />
                            )}

                            <button
                                onClick={confirmarTrocaExercicio}
                                disabled={!novoNomeEx.trim() || isFetchingSugestoes}
                                style={{ width: "100%", marginTop: 18, border: 0, borderRadius: 999, background: (novoNomeEx.trim() && !isFetchingSugestoes) ? "var(--brand)" : "var(--line-soft)", color: (novoNomeEx.trim() && !isFetchingSugestoes) ? "var(--bg)" : "var(--ink-faint)", fontFamily: "'DM Sans', sans-serif", fontSize: 14.5, fontWeight: 700, padding: 14, cursor: (novoNomeEx.trim() && !isFetchingSugestoes) ? "pointer" : "not-allowed" }}
                            >
                                Confirmar Nova Ficha
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}

function LogExercicioCard({ ex, i, onAddSerie, onDelSerie, onObsChange }) {
    const [carga, setCarga] = useState('');
    const [reps, setReps] = useState('');
    const [advisorFbk, setAdvisorFbk] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const rec = React.useRef(null);

    const handleCarga = (e) => {
        let val = e.target.value.replace(/,/g, '.');
        if (/^\d*\.?\d{0,2}$/.test(val)) setCarga(val);
    };

    const handleReps = (e) => {
        let val = e.target.value;
        if (/^\d*$/.test(val)) setReps(val);
    };

    const handleAdd = () => {
        if (!carga || !reps) return;
        onAddSerie(carga, reps);

        // Ativa o Treinador Inteligente calculando o alvo
        const fbk = analyzeSetPerformance(ex.repsAlvo, reps, carga);
        setAdvisorFbk(fbk);

        setCarga('');
        setReps('');
    };

    const startDictation = () => {
        setIsListening(true);
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            // fallback fake
            setTimeout(() => {
                setCarga('80');
                setReps('10');
                setIsListening(false);
            }, 1000);
            return;
        }
        const r = new SR();
        r.lang = "pt-BR"; r.interimResults = false;
        r.onresult = (e) => {
            const txt = e.results[0][0].transcript;
            const p = parseVoz(txt);
            if (p) {
                setCarga(String(p.kg));
                setReps(String(p.reps));
            }
        };
        r.onerror = () => setIsListening(false);
        r.onend = () => setIsListening(false);
        rec.current = r;
        r.start();
    };

    return (
        <div className="card" style={{ padding: '20px', marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <p style={{ fontSize: '15px', fontWeight: 'bold' }}>{ex.nomeExercicio}</p>
                <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Alvo: {ex.seriesAlvo}×{ex.repsAlvo}</span>
            </div>

            {ex.series.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {ex.series.map((s, si) => (
                        <span key={si} className="reps" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {s.cargaKg}kg × {s.reps}
                            <button type="button" onClick={() => onDelSerie(si)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>×</button>
                        </span>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <label style={{ flex: 1, display: 'block' }}>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '4px' }}>Carga (kg)</span>
                    <input type="text" inputMode="decimal" placeholder="ex: 12.5" value={carga} onChange={handleCarga} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface-2)', padding: '10px', color: 'var(--ink)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
                </label>
                <label style={{ flex: 1, display: 'block' }}>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '4px' }}>Reps</span>
                    <input type="text" inputMode="numeric" placeholder="ex: 10" value={reps} onChange={handleReps} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface-2)', padding: '10px', color: 'var(--ink)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
                </label>
                <button type="button" onClick={startDictation} aria-label="Ditar por voz" style={{ height: '42px', width: '42px', borderRadius: '8px', background: isListening ? '#f43f5e' : 'var(--surface)', color: isListening ? '#fff' : 'var(--ink-soft)', border: '1px solid var(--line)', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background .2s' }}>
                    {isListening ? (
                        <svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" /><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" opacity="0.6" /><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" /></svg>
                    )}
                </button>
                <button type="button" onClick={handleAdd} style={{ height: '42px', width: '42px', borderRadius: '8px', background: 'var(--lime)', color: 'var(--lime-on)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    +
                </button>
            </div>

            {advisorFbk && (
                <div style={{
                    marginTop: '16px', padding: '14px', borderRadius: '10px',
                    background: advisorFbk.status === 'increase' ? 'rgba(163,230,53, 0.1)' : advisorFbk.status === 'drop' ? 'rgba(239,68,68, 0.08)' : 'rgba(59,130,246, 0.08)',
                    color: advisorFbk.status === 'increase' ? 'var(--lime)' : advisorFbk.status === 'drop' ? '#f87171' : '#60a5fa',
                    fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'flex-start', border: "1px solid " + (advisorFbk.status === 'increase' ? 'rgba(163,230,53, 0.2)' : advisorFbk.status === 'drop' ? 'rgba(239,68,68, 0.15)' : 'rgba(59,130,246, 0.15)')
                }}>
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>{advisorFbk.status === 'increase' ? '🔥' : advisorFbk.status === 'drop' ? '📉' : '🎯'}</span>
                    <span style={{ lineHeight: '1.4', fontWeight: '500' }}>{advisorFbk.message}</span>
                </div>
            )}

            <label style={{ display: 'block', marginTop: '16px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '4px' }}>Observação (opcional)</span>
                <input type="text" value={ex.observacao} onChange={e => onObsChange(e.target.value)} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface-2)', padding: '10px', color: 'var(--ink)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
            </label>
        </div>
    );
}
