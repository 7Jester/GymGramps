import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';

function hhmm(m) {
    return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}
function durLabel(m) {
    const h = Math.floor(m / 60), x = m % 60;
    return h ? (x ? h + 'h' + String(x).padStart(2, '0') : h + 'h') : x + 'min';
}
function pct(m) {
    return (m / 1440 * 100).toFixed(2) + '%';
}
const CAT_COLOR = { treino: 'var(--lime)', estudo: 'var(--accent)', casa: 'var(--ink-faint)', refeicao: 'var(--ocre)' };
const SEG_COLOR = { lime: 'var(--lime)', moss: 'var(--accent)', soft: 'rgba(237,234,224,.3)', soft2: 'rgba(237,234,224,.18)' };

export default function Cronograma() {
    const [now, setNow] = useState(() => {
        const d = new Date();
        return d.getHours() * 60 + d.getMinutes();
    });

    // Core states
    const [rawCrono, setRawCrono] = useState([]);

    // Visual parsed states
    const [routine, setRoutine] = useState([]);
    const [segments, setSegments] = useState([]);
    const [shares, setShares] = useState([]);
    const [week, setWeek] = useState([]);

    // Editing states
    const [isEditing, setIsEditing] = useState(false);
    const [editBlocks, setEditBlocks] = useState([]);
    const [editDays, setEditDays] = useState([true, true, true, true, true, false, false]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    useEffect(() => {
        const tmr = setInterval(() => {
            const d = new Date();
            setNow(d.getHours() * 60 + d.getMinutes());
        }, 30000);
        return () => clearInterval(tmr);
    }, []);

    const buildRoutine = (cronoItems) => {
        try {
            const tObj = JSON.parse(localStorage.getItem('gymgramps_treino'));
            const pObj = JSON.parse(localStorage.getItem('gymgramps_perfil'));

            if (!cronoItems || !cronoItems.length) return;

            function timeToMins(t) {
                if (!t) return 0;
                const [h, m] = t.split(':');
                return parseInt(h) * 60 + parseInt(m);
            }

            let parsedRoutine = cronoItems.map((b, i, arr) => {
                const s = timeToMins(b.horario);
                let nextS = 1440;
                if (i < arr.length - 1) {
                    nextS = timeToMins(arr[i + 1].horario);
                    if (nextS <= s) nextS += 1440;
                } else {
                    nextS = Math.min(s + 60, 1440);
                }

                let cat = 'casa';
                if (b.tipo === 'treino') cat = 'treino';
                else if (b.tipo === 'estudo' || b.tipo === 'faculdade' || b.tipo === 'trabalho') cat = 'estudo';
                else if (b.tipo === 'refeicao') cat = 'refeicao';

                return { s, e: nextS, name: b.titulo, note: b.descricao, cat };
            });

            parsedRoutine.sort((a, b) => a.s - b.s);

            let segs = [];
            let catTimes = { treino: 0, estudo: 0, casa: 0, refeicao: 0 };

            parsedRoutine.forEach((b) => {
                let color = 'soft';
                if (b.cat === 'treino') color = 'lime';
                else if (b.cat === 'estudo') color = 'moss';

                segs.push([b.s, Math.min(b.e, 1440), color]);
                catTimes[b.cat] += (b.e - b.s);
            });

            let finalSegs = [];
            segs.forEach(sg => finalSegs.push(sg));

            let allShares = [
                { name: 'Sono e casa', hours: durLabel(catTimes.casa), w: (catTimes.casa / 1440) * 100, color: 'var(--ink-faint)' },
                { name: 'Produtividade', hours: durLabel(catTimes.estudo), w: (catTimes.estudo / 1440) * 100, color: 'var(--accent)' },
                { name: 'Refeições', hours: durLabel(catTimes.refeicao), w: (catTimes.refeicao / 1440) * 100, color: 'var(--ocre)' },
                { name: 'Treino', hours: durLabel(catTimes.treino), w: (catTimes.treino / 1440) * 100, color: 'var(--lime)' }
            ].filter(x => x.w > 0);

            let dArr = tObj?.diasTreino;
            if (!dArr || !Array.isArray(dArr)) {
                let dps = tObj?.diasPorSemana || 5;
                dArr = [false, false, false, false, false, false, false];
                for (let i = 0; i < dps && i < 7; i++) dArr[i] = true;
            }

            let w = [
                { d: 'Seg', p: 'Descanso' }, { d: 'Ter', p: 'Descanso' }, { d: 'Qua', p: 'Descanso' },
                { d: 'Qui', p: 'Descanso' }, { d: 'Sex', p: 'Descanso' },
                { d: 'Sáb', p: 'Descanso', rest: true }, { d: 'Dom', p: 'Descanso', rest: true }
            ];

            for (let i = 0; i < 7; i++) {
                if (dArr[i]) {
                    w[i].p = tObj?.divisao ? 'Treino · ' + tObj.divisao.split('-')[0] : 'Treino';
                    w[i].rest = false;
                } else {
                    w[i].rest = true;
                    if (w[i].d !== 'Sáb' && w[i].d !== 'Dom') w[i].p = 'Descanso ativo';
                }
            }
            let currentDay = (new Date().getDay() + 6) % 7;
            w[currentDay].today = true;

            setRoutine(parsedRoutine);
            setSegments(finalSegs);
            setShares(allShares);
            setWeek(w);

        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const cObj = JSON.parse(localStorage.getItem('gymgramps_cronograma'));
        const crono = cObj?.cronograma || cObj || [];
        setRawCrono(crono);
        buildRoutine(crono);
    }, []);

    const enterEditMode = () => {
        setEditBlocks(JSON.parse(JSON.stringify(rawCrono)));
        let tObj = {};
        try { tObj = JSON.parse(localStorage.getItem('gymgramps_treino')) || {}; } catch (e) { }
        if (tObj.diasTreino && Array.isArray(tObj.diasTreino)) {
            setEditDays(tObj.diasTreino);
        } else {
            let dps = tObj.diasPorSemana || 5;
            let d = [false, false, false, false, false, false, false];
            for (let i = 0; i < dps && i < 7; i++) d[i] = true;
            setEditDays(d);
        }
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        const newFrequencia = editDays.filter(Boolean).length;
        let tObj = {};
        let pObj = {};
        try { tObj = JSON.parse(localStorage.getItem('gymgramps_treino')) || {}; } catch (e) { }
        try { pObj = JSON.parse(localStorage.getItem('gymgramps_perfil')) || {}; } catch (e) { }

        const oldFrequencia = tObj?.diasPorSemana || 5;

        if (newFrequencia !== oldFrequencia) {
            const isPro = pObj?.isPro === true;
            if (!isPro) {
                alert(`Você alterou sua frequência de ${oldFrequencia} para ${newFrequencia} dias. Recalcular sua ficha adaptativa com IA para essa nova frequência é um recurso exclusivo 🌟 PRO. Faça o upgrade para desbloquear!`);
                return; // Do not apply changes
            }

            const conf = window.confirm(`Você alterou a quantidade de treinos da semana de ${oldFrequencia} para ${newFrequencia} dias.\nDeseja que a inteligência artificial reestruture toda a sua ficha de treino agora mesmo?`);
            if (!conf) return;

            setIsGeneratingAI(true);
            try {
                const rotinaArr = rawCrono || [];
                const reqBody = {
                    perfil: pObj,
                    rotina: rotinaArr,
                    frequencia: newFrequencia,
                    local: 'Academia'
                };

                const res = await fetch('http://localhost:3000/api/onboarding/gerar-treino', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqBody)
                });

                if (!res.ok) throw new Error("AI call failed");
                const newTreinData = await res.json();
                tObj = { ...newTreinData };
            } catch (e) {
                console.error(e);
                alert("Erro ao recalcular o treino com a IA. Tente novamente em instantes.");
                setIsGeneratingAI(false);
                return;
            }
            setIsGeneratingAI(false);
        }

        tObj.diasTreino = editDays;
        tObj.diasPorSemana = newFrequencia;

        // Ordena pelo horário da string pra arrumar visualmente
        const sorted = [...editBlocks].sort((a, b) => {
            const minA = parseInt(a.horario.split(':')[0] || 0) * 60 + parseInt(a.horario.split(':')[1] || 0);
            const minB = parseInt(b.horario.split(':')[0] || 0) * 60 + parseInt(b.horario.split(':')[1] || 0);
            return minA - minB;
        });

        setRawCrono(sorted);

        let cObj = {};
        try {
            const raw = JSON.parse(localStorage.getItem('gymgramps_cronograma'));
            cObj = raw || {};
        } catch (e) { }

        cObj.cronograma = sorted;
        localStorage.setItem('gymgramps_cronograma', JSON.stringify(cObj));
        localStorage.setItem('gymgramps_treino', JSON.stringify(tObj));

        buildRoutine(sorted);
        setIsEditing(false);
    };

    const addBlock = () => {
        setEditBlocks([...editBlocks, { horario: '12:00', titulo: 'Novo Bloco', descricao: '', tipo: 'outro' }]);
    };

    const updateBlock = (idx, field, value) => {
        const nb = [...editBlocks];
        nb[idx][field] = value;
        setEditBlocks(nb);
    };

    const removeBlock = (idx) => {
        const nb = [...editBlocks];
        nb.splice(idx, 1);
        setEditBlocks(nb);
    };

    if (!routine.length) {
        return (
            <>
                <Header />
                <main className="wrap">
                    <div style={{ padding: '80px 0', textAlign: 'center' }}>
                        Nenhuma rotina salva ainda. Complete o passo a passo da IA primeiro!
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (isEditing) {
        let maxStreak = 0;
        let streak = 0;
        for (let i = 0; i < 14; i++) {
            if (editDays[i % 7]) streak++;
            else { maxStreak = Math.max(maxStreak, streak); streak = 0; }
        }
        maxStreak = Math.max(maxStreak, streak);

        return (
            <>
                <Header />
                <main className="wrap">
                    <section className="screen">
                        <div className="page-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
                            <div>
                                <div className="eyebrow">Edição de Rotina</div>
                                <h1>Ajuste seus horários</h1>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '20px', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsEditing(false)}>✕</button>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
                            <div className="eyebrow" style={{ marginBottom: '12px' }}>Dias da Semana com Treino</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            const n = [...editDays];
                                            n[i] = !n[i];
                                            setEditDays(n);
                                        }}
                                        style={{
                                            flex: '1 1 40px',
                                            padding: '12px 4px',
                                            fontWeight: '500',
                                            borderRadius: '8px',
                                            border: `1px solid ${editDays[i] ? 'var(--lime)' : 'var(--line)'}`,
                                            background: editDays[i] ? 'rgba(74, 222, 128, 0.1)' : 'var(--surface)',
                                            color: editDays[i] ? 'var(--lime)' : 'var(--ink)'
                                        }}>
                                        {dia}
                                    </button>
                                ))}
                            </div>
                            {maxStreak >= 5 && (
                                <div style={{ color: 'var(--accent)', fontSize: '14px', marginTop: '16px', background: 'var(--surface)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--accent)', lineHeight: '1.4' }}>
                                    <b>💡 Dica da ciência:</b> Você marcou 5 ou mais dias consecutivos de treino. Considere intercalar um <b>dia de descanso ativo</b> no meio da semana (ex: caminhar, alongar) para maximizar a recuperação muscular!
                                </div>
                            )}
                        </div>

                        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {editBlocks.map((b, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 180px 1fr 140px auto', gap: '12px', alignItems: 'start', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                                    <div>
                                        <div className="eyebrow" style={{ marginBottom: '6px' }}>Horário</div>
                                        <input type="time" value={b.horario} onChange={e => updateBlock(i, 'horario', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface)' }} />
                                    </div>
                                    <div>
                                        <div className="eyebrow" style={{ marginBottom: '6px' }}>Tipo</div>
                                        <select value={b.tipo} onChange={e => updateBlock(i, 'tipo', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}>
                                            <option value="casa">Casa / Sono</option>
                                            <option value="estudo">Estudo / Foco</option>
                                            <option value="faculdade">Faculdade</option>
                                            <option value="trabalho">Trabalho</option>
                                            <option value="refeicao">Refeição</option>
                                            <option value="treino">Treino</option>
                                            <option value="outro">Outro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div className="eyebrow" style={{ marginBottom: '6px' }}>Título</div>
                                        <input type="text" value={b.titulo} onChange={e => updateBlock(i, 'titulo', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }} />
                                        <input type="text" placeholder="Detalhes (Opcional)" value={b.descricao} onChange={e => updateBlock(i, 'descricao', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface)', marginTop: '8px', color: 'var(--ink)' }} />
                                    </div>
                                    <div style={{ marginTop: '26px' }}>
                                        <button className="btn-outline" onClick={() => removeBlock(i)} style={{ color: 'var(--danger)', padding: '9px 12px' }}>Remover</button>
                                    </div>
                                </div>
                            ))}

                            <button className="btn-outline" onClick={addBlock} style={{ alignSelf: 'flex-start', marginTop: '8px' }}>+ Adicionar Bloco</button>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-ghost" onClick={() => setIsEditing(false)} disabled={isGeneratingAI}>Cancelar</button>
                            <button className="btn btn-lime" onClick={handleSaveEdit} disabled={isGeneratingAI}>
                                {isGeneratingAI ? 'Gerando com IA...' : 'Salvar alterações'}
                            </button>
                        </div>
                    </section>
                </main>
                <Footer />
            </>
        )
    }

    const d = new Date();
    const clock = hhmm(now);
    const dayNames = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

    const current = routine.filter(b => b.cat !== 'refeicao').reduce((a, b) => (now >= b.s && now < b.e ? b : a), null)
        || routine.find(b => b.cat !== 'refeicao' && b.s > now) || routine[0] || {};
    const next = routine.find(b => b.s > now);

    return (
        <>
            <Header />
            <main className="wrap">
                <section className="screen" id="rotina">
                    <div className="page-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
                        <div>
                            <div className="eyebrow">Rotina · <span id="rot-weekday" style={{ textTransform: 'capitalize' }}>{dayNames[d.getDay()]}</span></div>
                            <h1>Seu dia,<br />hora a hora.</h1>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="mono" id="rot-clock" style={{ fontSize: '34px', fontWeight: '600', letterSpacing: '-.03em', lineHeight: '1' }}>{clock}</div>
                            <div style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '8px' }} id="rot-progress">{Math.round(now / 1440 * 100)}% do dia percorrido</div>
                        </div>
                    </div>

                    <section className="ribbon">
                        <div className="ribbon-top">
                            <div>
                                <div className="ribbon-live"><span className="dot"></span><span className="eyebrow">Agora · <span id="rot-clock-2">{clock}</span></span></div>
                                <h2 id="rot-now-name">{current.name || '—'}</h2>
                                <p id="rot-now-note">{current.note || ''}</p>
                            </div>
                            <div className="ribbon-aside">
                                <div><div className="eyebrow">Termina em</div><div className="big" id="rot-remaining">{(now >= current.s && now < current.e) ? durLabel(current.e - now) : 'começa às ' + hhmm(current.s || 0)}</div></div>
                                <div><div className="eyebrow">Em seguida</div><div style={{ fontSize: '15px', fontWeight: '500' }} id="rot-next">{next ? next.name + ' · ' + hhmm(next.s) : 'Amanhã, 06:30'}</div></div>
                            </div>
                        </div>

                        <div className="ribbon-chart">
                            <div className="ribbon-meals" id="rot-meals">
                                {routine.filter(b => b.cat === 'refeicao').map((b, i) => (
                                    <div key={i} className="meal-tick" style={{ left: pct(b.s) }}><b>{hhmm(b.s)}</b><i></i></div>
                                ))}
                            </div>
                            <div className="ribbon-track" id="rot-track">
                                {segments.map(([s, e, c], i) => (
                                    <div key={i} className="ribbon-seg" style={{ left: pct(s), width: pct(e - s), background: SEG_COLOR[c] }}></div>
                                ))}
                            </div>
                            <div className="ribbon-now" id="rot-marker" style={{ left: pct(now) }}><span></span></div>
                            <div className="ribbon-hours"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>24h</span></div>
                        </div>

                        <div className="ribbon-legend">
                            <span><i className="sw sw-lime"></i>Treino</span>
                            <span><i className="sw sw-moss"></i>Faculdade e estudo</span>
                            <span><i className="sw sw-soft"></i>Casa, sono e descanso</span>
                            <span><i className="tick"></i>Refeições</span>
                        </div>
                    </section>

                    <div className="split" style={{ marginTop: '14px' }}>
                        <div className="card timeline" id="rot-timeline">
                            {routine.map((b, i) => (
                                <div key={i} className={`tl-row${b.e <= now ? ' past' : ''}`}>
                                    <div className="time">{hhmm(b.s)}</div>
                                    <div className="tl-rail">
                                        <span className="line"></span>
                                        <span className="dot" style={{ background: CAT_COLOR[b.cat] }}></span>
                                    </div>
                                    <div>
                                        <div className="tl-head">
                                            <span className="name">{b.name}</span>
                                            {b === current && <span className="now">Agora</span>}
                                            {b.e <= now && <span className="check">✓</span>}
                                        </div>
                                        <div className="tl-note">{b.note}</div>
                                    </div>
                                    <div className="tl-dur">{durLabel(b.e - b.s)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="stack">
                            <div className="card" style={{ padding: '24px' }}>
                                <div className="eyebrow" style={{ marginBottom: '18px' }}>Como o dia se divide</div>
                                <div className="shares" id="rot-shares">
                                    {shares.map((s, i) => (
                                        <div key={i}>
                                            <div className="share-top"><span className="n">{s.name}</span><span className="h">{s.hours}</span></div>
                                            <div className="share-track"><div className="share-fill" style={{ width: s.w + '%', background: s.color }}></div></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card" style={{ padding: '24px' }}>
                                <div className="eyebrow" style={{ marginBottom: '18px' }}>Semana</div>
                                <div id="rot-week">
                                    {week.map((w, i) => (
                                        <div key={i} className={`week-row${w.rest ? ' rest' : ''}`}>
                                            <span className="d">{w.d}</span>
                                            <span className="p">{w.p}</span>
                                            <span className="s" style={{ background: w.today ? 'var(--lime)' : w.rest ? 'var(--line-faint)' : 'var(--accent)' }}></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="btn-block" onClick={enterEditMode}>Editar minha rotina</button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
