import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, getSession } from '../../js/api/authApi.js';
import { saveUserData } from '../../js/api/dbApi.js';

export default function Onboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [perfil, setPerfil] = useState({ idade: '19', sexo: 'masculino', peso: '77', altura: '173', objetivo: 'ganho_massa' });
    const [rotina, setRotina] = useState([]);
    const [frequenciaTreino, setFrequenciaTreino] = useState(5);
    const [restricao, setRestricao] = useState('');

    // Additional UI states
    const [localTreino, setLocalTreino] = useState('Academia');
    const [atividadeOffset, setAtividadeOffset] = useState('Sedentário');

    // Routine Form
    const [formHorario, setFormHorario] = useState({ tipo: 'trabalho', dias: [1, 2, 3, 4, 5], horaInicio: '08:00', horaFim: '17:00' });
    const [formOutroDesc, setFormOutroDesc] = useState('');

    // Generated states from AI
    const [treinoPlan, setTreinoPlan] = useState(null);
    const [dietaPlan, setDietaPlan] = useState(null);
    const [cronogramaPlan, setCronogramaPlan] = useState(null);

    const totalSteps = 5;

    const handleGenerateTreino = async () => {
        // Agora o treino é gerado tudo no passo Final! Apenas avancamos.
        setStep(4);
    };

    const handleGenerateDietaECrono = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/onboarding/gerar-plano-final', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ perfil, rotina, frequencia: frequenciaTreino, local: localTreino, restricoes: restricao })
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            const dataTreino = data.treino;
            const dataDieta = data.dieta;
            // A IA pode retornar data.cronograma direto como array ou aninhado
            const dataCrono = data.cronograma?.cronograma ? data.cronograma : { cronograma: data.cronograma };

            setTreinoPlan(dataTreino);
            setDietaPlan(dataDieta);
            setCronogramaPlan(dataCrono);

            // Saves to Local Storage
            localStorage.setItem('gymgramps_perfil', JSON.stringify(perfil));
            localStorage.setItem('gymgramps_treino', JSON.stringify(treinoPlan));
            localStorage.setItem('gymgramps_dieta', JSON.stringify(dataDieta));
            localStorage.setItem('gymgramps_cronograma', JSON.stringify(dataCrono));

            const session = await getSession();
            if (session?.user) {
                await saveUserData(session.user.id, {
                    perfil,
                    treino: treinoPlan,
                    dieta: dataDieta,
                    cronograma: dataCrono
                });
            }

            setStep(5);
        } catch (e) {
            alert("Erro ao gerar dieta ou cronograma final.");
        }
        setIsLoading(false);
    };

    const handleNext = async () => {
        if (step === 1) setStep(2);
        else if (step === 2) {
            if (!perfil.idade || !perfil.peso || !perfil.altura) {
                alert("Preencha todos os dados."); return;
            }
            setStep(3);
        }
        else if (step === 3) await handleGenerateTreino();
        else if (step === 4) await handleGenerateDietaECrono();
        else if (step === 5) navigate('/dashboard');
    };

    const toggleDiaRotina = (d) => {
        const novos = formHorario.dias.includes(d) ? formHorario.dias.filter(x => x !== d) : [...formHorario.dias, d].sort();
        setFormHorario({ ...formHorario, dias: novos });
    };

    const addRotina = () => {
        if (formHorario.dias.length === 0 || !formHorario.horaInicio || !formHorario.horaFim) return;
        setRotina([...rotina, { id: crypto.randomUUID(), ...formHorario, descricao: formOutroDesc }]);
        setFormOutroDesc('');
    };

    const removeRotina = (id) => setRotina(rotina.filter(r => r.id !== id));

    const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

    return (
        <div className="view ob">
            <div className="ob-top">
                <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 100% { transform: rotate(360deg); } }` }} />
                <div className="inner">
                    <div className="logo"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M50.79 38.84A20 20 0 1 1 50.79 25.16" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /><path className="brand-mark-bar" d="M30 32H55" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /></svg></span><span className="word">GymGramps</span></div>
                    <div className="bars">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <i key={i} className={i < step ? "on" : ""}></i>
                        ))}
                    </div>
                    <span className="ob-count">{step} / {totalSteps}</span>
                </div>
            </div>

            <div className="ob-body">
                {step === 1 && (
                    <section className="step">
                        <div className="eyebrow">Etapa 1 · Objetivo</div>
                        <h1>O que você quer<br />alcançar agora?</h1>
                        <p className="lede">Isso define suas calorias e a divisão do treino. Você pode mudar depois.</p>
                        <div className="stack-12">
                            {[
                                { val: 'ganho_massa', title: 'Ganhar massa muscular', sub: 'Foco no aumento do peso corporal com músculos.' },
                                { val: 'perda_gordura', title: 'Perder gordura', sub: 'Reduzir as medidas mantendo ao máximo a massa magra.' },
                                { val: 'manutencao', title: 'Recomposição geral', sub: 'Melhorar a composição do corpo sem mudar tanto o peso na balança.' }
                            ].map(opt => (
                                <button key={opt.val} className="opt opt-card" aria-pressed={perfil.objetivo === opt.val} onClick={() => setPerfil({ ...perfil, objetivo: opt.val })}>
                                    <div>
                                        <div className="opt-title">{opt.title}</div>
                                        <div className="opt-sub">{opt.sub}</div>
                                    </div>
                                    <div className="dot">✓</div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {step === 2 && (
                    <section className="step">
                        <div className="eyebrow">Etapa 2 · Corpo</div>
                        <h1>Seus dados básicos</h1>
                        <p className="lede">Usamos para estimar seu gasto energético (TMB).</p>
                        <div className="panel">
                            <div className="grid-2">
                                <label><span className="label">Idade</span><input type="number" value={perfil.idade} onChange={e => setPerfil({ ...perfil, idade: e.target.value })} /></label>
                                <label><span className="label">Altura (cm)</span><input type="number" value={perfil.altura} onChange={e => setPerfil({ ...perfil, altura: e.target.value })} /></label>
                                <label><span className="label">Peso (kg)</span><input type="number" step="0.1" value={perfil.peso} onChange={e => setPerfil({ ...perfil, peso: e.target.value })} /></label>
                                <div>
                                    <span className="label">Sexo</span>
                                    <div className="row-flex" style={{ flexWrap: 'wrap' }}>
                                        {['masculino', 'feminino'].map(s => (
                                            <button key={s} className="opt opt-btn" aria-pressed={perfil.sexo === s} onClick={() => setPerfil({ ...perfil, sexo: s })} style={{ textTransform: 'capitalize' }}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="divider">
                                <span className="label">Restrições ou Alergias (Opcional)</span>
                                <input type="text" placeholder="Ex: Intolerante à lactose, vegano" value={restricao} onChange={e => setRestricao(e.target.value)} style={{ width: '100%', marginBottom: '20px' }} />

                                <span className="label">Nível de atividade fora da academia</span>
                                <div className="stack-8">
                                    {['Sedentário', 'Leve (passos do dia)', 'Moderado (trabalha em pé)', 'Intenso'].map(a => (
                                        <button key={a} className="opt opt-row" aria-pressed={atividadeOffset === a} onClick={() => setAtividadeOffset(a)}>
                                            {a} <div className="dot" style={{ position: 'relative' }}>✓</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {step === 3 && (
                    <section className="step">
                        <div className="eyebrow">Etapa 3 · Treino</div>
                        <h1>Quantos dias por<br />semana você treina?</h1>
                        <p className="lede">Sugerimos a divisão que melhor aproveita esses dias.</p>
                        <div className="row-flex" style={{ marginBottom: '24px' }}>
                            {[3, 4, 5, 6].map(d => (
                                <button key={d} className="opt opt-day" aria-pressed={frequenciaTreino === d} onClick={() => setFrequenciaTreino(d)}>
                                    {d}
                                </button>
                            ))}
                        </div>
                        {isLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                                <svg className="spinner-icon" viewBox="0 0 50 50" style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', color: 'var(--brand)' }}>
                                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                                </svg>
                                <p style={{ fontSize: '14px', color: 'var(--brand)', fontWeight: 'bold', margin: 0 }}>Consultando base esportiva e biomecânica para moldar seu protocolo...</p>
                            </div>
                        )}
                        {!isLoading && (
                            <div className="dark-card" style={{ marginBottom: '14px' }}>
                                <div className="eyebrow">Divisão sugerida</div>
                                <h2>Adaptativa</h2>
                                <p>Sua divisão exata será moldada no último passo, respeitando seus <b>{frequenciaTreino} dias</b> na/no <b>{localTreino}</b>.</p>
                            </div>
                        )}
                        <div className="panel" style={{ padding: '22px 24px' }}>
                            <span className="label">Onde você treina</span>
                            <div className="row-flex" style={{ flexWrap: 'wrap' }}>
                                {['Academia', 'Em casa', 'Parque/Crossfit'].map(p => (
                                    <button key={p} className="opt opt-btn" aria-pressed={localTreino === p} onClick={() => setLocalTreino(p)}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {step === 4 && (
                    <section className="step">
                        <div className="eyebrow">Etapa 4 · Rotina</div>
                        <h1>Como é o seu dia?</h1>
                        <p className="lede">Os horários das refeições e do treino são encaixados nas suas janelas livres.</p>
                        <div className="panel-flush">
                            <div style={{ padding: '20px' }}>
                                <label className="label">Tipo</label>
                                <div className="row-flex" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
                                    {[{ val: 'trabalho', label: 'Trabalho' }, { val: 'faculdade', label: 'Faculdade' }, { val: 'sono', label: 'Sono' }, { val: 'outro', label: 'Outro' }].map(t => (
                                        <button key={t.val} className="opt opt-btn" aria-pressed={formHorario.tipo === t.val} onClick={() => setFormHorario({ ...formHorario, tipo: t.val })}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                                {formHorario.tipo === 'outro' && (
                                    <input type="text" placeholder="Ex: Inglês..." value={formOutroDesc} onChange={e => setFormOutroDesc(e.target.value)} style={{ width: '100%', marginBottom: '16px' }} />
                                )}
                                <label className="label">Dias</label>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    {dayLabels.map((d, i) => (
                                        <button key={i} className="opt" style={{ flex: 1, aspectRatio: 1, borderRadius: '50%', textAlign: 'center', fontWeight: 'bold' }} aria-pressed={formHorario.dias.includes(i)} onClick={() => toggleDiaRotina(i)}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid-2">
                                    <label><span className="label">Início</span><input type="time" value={formHorario.horaInicio} onChange={e => setFormHorario({ ...formHorario, horaInicio: e.target.value })} /></label>
                                    <label><span className="label">Fim</span><input type="time" value={formHorario.horaFim} onChange={e => setFormHorario({ ...formHorario, horaFim: e.target.value })} /></label>
                                </div>
                                <button className="btn-block" style={{ marginTop: '16px' }} onClick={addRotina}>Incluir na rotina</button>
                            </div>

                            {rotina.map(r => (
                                <div key={r.id} className="routine-row">
                                    <div>
                                        <div className="t" style={{ textTransform: 'capitalize' }}>{r.tipo} {r.tipo === 'outro' ? '- ' + r.descricao : ''}</div>
                                        <div className="d">{r.dias.map(d => dayLabels[d]).join(" ")}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px', textAlign: 'right' }}>{r.horaInicio} - {r.horaFim}</div>
                                    <button className="btn-danger" style={{ padding: '8px' }} onClick={() => removeRotina(r.id)}>Remover</button>
                                </div>
                            ))}
                        </div>
                        {isLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                                <svg className="spinner-icon" viewBox="0 0 50 50" style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', color: 'var(--brand)' }}>
                                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                                </svg>
                                <p style={{ fontSize: '14px', color: 'var(--brand)', fontWeight: 'bold', margin: 0 }}>Calculando macronutrientes e otimizando a fisiologia na sua rotina...</p>
                            </div>
                        )}
                    </section>
                )}

                {step === 5 && cronogramaPlan && dietaPlan && (
                    <section className="step">
                        <div className="eyebrow">Etapa 5 · Pronto</div>
                        <h1>Seu plano está montado</h1>
                        <p className="lede">Confira os números antes de começar — tudo é editável depois.</p>

                        <div className="summary">
                            <div>
                                <div className="eyebrow" style={{ color: 'var(--lime)', marginBottom: '12px' }}>Meta diária</div>
                                <div className="kcal">{dietaPlan.metaCalorica} <small>kcal</small></div>
                                <div className="macros">
                                    <div><div className="k">PROT</div><div className="v">{dietaPlan.macros?.proteinaG || 0}g</div></div>
                                    <div><div className="k">CARB</div><div className="v">{dietaPlan.macros?.carboG || 0}g</div></div>
                                    <div><div className="k">GORD</div><div className="v">{dietaPlan.macros?.gorduraG || 0}g</div></div>
                                </div>
                            </div>
                            <div className="aside">
                                <div><div className="k">Objetivo</div><div className="v" style={{ textTransform: 'capitalize' }}>{perfil.objetivo.replace('_', ' ')}</div></div>
                                <div><div className="k">Divisão</div><div className="v">{treinoPlan?.divisao?.split(' - ')[0]} · {frequenciaTreino}× semana</div></div>
                                <div><div className="k">Refeições</div><div className="v">{dietaPlan.refeicoes?.length || 0} por dia</div></div>
                            </div>
                        </div>

                        <div className="cards-3">
                            <div className="card"><div className="label">1º dia</div><div className="t">{treinoPlan?.treinoDia?.[0]?.nome}</div><div className="d">Recomendado iniciar amanhã</div></div>
                            <div className="card"><div className="label">Cronograma</div><div className="t">{cronogramaPlan?.cronograma?.length} blocos gerados</div><div className="d">Treinos + Refeições + Rotina</div></div>
                        </div>

                        <p className="note">Estimativas educativas baseadas em fórmulas gerais (TMB). Não substituem acompanhamento de nutricionista (CFN) ou profissional de Educação Física (CREF).</p>
                    </section>
                )}
            </div>

            <div className="ob-bottom">
                <div className="inner">
                    <button className="btn-back" onClick={async () => {
                        if (step > 1) {
                            setStep(step - 1);
                        } else {
                            await signOut();
                            navigate('/login');
                        }
                    }}>
                        {step === 1 ? 'Sair' : 'Voltar'}
                    </button>
                    <span className="ob-hint"></span>
                    <button className={`btn-next ${step === totalSteps ? 'final' : ''}`} disabled={isLoading} onClick={handleNext}>
                        {step === totalSteps ? (isLoading ? 'Construindo...' : 'Finalizar') : (isLoading ? 'Gerando...' : 'Continuar')}
                    </button>
                </div>
            </div>
        </div >
    );
}
