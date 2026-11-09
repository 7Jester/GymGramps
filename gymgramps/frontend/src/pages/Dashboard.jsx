import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';
import { getSession } from '../js/api/authApi.js';
import { fetchUserData } from '../js/api/dbApi.js';
import EvoDashboard from '../components/EvoDashboard.jsx';
import Liga from '../components/Liga.jsx';
import MissoesDoDia from '../components/fase2/MissoesDoDia.jsx';

export default function Dashboard() {
    const [session, setSession] = useState(null);
    const [apelido, setApelido] = useState("Atleta");
    const [cronograma, setCronograma] = useState(null);
    const [dieta, setDieta] = useState(null);
    const [treino, setTreino] = useState(null);
    const navigate = useNavigate();

    const isProUser = session?.user?.email === 'dudacalixto1403@gmail.com';

    useEffect(() => {
        async function load() {
            try {
                const s = await getSession();
                if (s) {
                    setSession(s);
                    setApelido(s.user?.user_metadata?.apelido || "Atleta");

                    const dbData = await fetchUserData(s.user.id);
                    if (dbData) {
                        if (dbData.perfil) localStorage.setItem('gymgramps_perfil', JSON.stringify(dbData.perfil));
                        if (dbData.treino) localStorage.setItem('gymgramps_treino', JSON.stringify(dbData.treino));
                        if (dbData.dieta) localStorage.setItem('gymgramps_dieta', JSON.stringify(dbData.dieta));
                        if (dbData.cronograma) localStorage.setItem('gymgramps_cronograma', JSON.stringify(dbData.cronograma));
                        if (dbData.refeicoes) localStorage.setItem('gymgramps_refeicoes', JSON.stringify(dbData.refeicoes));
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar dados do Supabase", err);
            }

            try {
                const savedCrono = JSON.parse(localStorage.getItem('gymgramps_cronograma'));
                const savedDieta = JSON.parse(localStorage.getItem('gymgramps_dieta'));
                const savedTreino = JSON.parse(localStorage.getItem('gymgramps_treino'));

                if (!savedCrono || !savedDieta || savedDieta.error || savedCrono.error || !savedDieta.metaCalorica) {
                    localStorage.removeItem('gymgramps_cronograma');
                    localStorage.removeItem('gymgramps_dieta');
                    localStorage.removeItem('gymgramps_treino');
                    navigate('/onboarding');
                    return;
                }

                if (savedCrono) setCronograma(savedCrono.cronograma || savedCrono);
                if (savedDieta) setDieta(savedDieta);
                if (savedTreino) setTreino(savedTreino);
            } catch (e) {
                console.error("Erro no local storage: ", e);
            }
        }
        load();
    }, [navigate]);

    const diasTreino = treino?.diasPorSemana || 5;
    const proximasRefeicoes = dieta?.refeicoes || [];

    const getNextActivity = (schedule) => {
        if (!schedule || schedule.length === 0) return null;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        for (const item of schedule) {
            if (item.horario) {
                const parts = item.horario.split(':');
                if (parts.length >= 2) {
                    const itemMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                    if (itemMinutes >= currentMinutes) {
                        return item;
                    }
                }
            }
        }
        return schedule[0]; // Volta pro primeiro se passar de todos
    };

    const proximoBloco = getNextActivity(cronograma) || { horario: "--:--", tipo: "", titulo: "Carregando...", descricao: "..." };

    // Formatando data atual para o header (ex: Quinta, 27 de agosto)
    const dataAtual = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

    if (!cronograma || !dieta) return null;

    return (
        <>
            <Header />
            <main className="wrap">
                <section className="screen" id="home">
                    <div className="page-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
                        <div>
                            <div className="eyebrow" style={{ textTransform: 'capitalize' }}>{dataAtual}</div>
                            <h1>Bom treino,<br />{apelido}.</h1>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '14px', color: 'var(--ink-soft)', maxWidth: '240px', textWrap: 'pretty' }}>
                            Você está na semana 1 do seu plano. Nada registrado ainda hoje.
                        </div>
                    </div>

                    <div className="feature">
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                                <span className="eyebrow">Próximo no cronograma</span>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(237,234,224,.4)' }}></span>
                                <span className="mono" style={{ fontSize: '12px', color: 'rgba(237,234,224,.75)' }}>{proximoBloco.horario}</span>
                            </div>
                            <h2>{proximoBloco.titulo}</h2>
                            <p>{proximoBloco.descricao}</p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <Link to="/cronograma" className="btn btn-lime">Ver cronograma completo</Link>
                                <button onClick={() => navigate(proximoBloco.tipo === 'refeicao' ? '/alimentacao' : '/treino')} className="btn btn-ghost">Marcar como feito</button>
                            </div>
                        </div>
                        <div className="aside">
                            <div>
                                <div className="eyebrow">Meta de Calorias</div>
                                <div style={{ fontSize: '15px', fontWeight: '500' }}>{dieta?.metaCalorica} kcal / dia</div>
                            </div>
                            <div>
                                <div className="eyebrow">Treino de hoje</div>
                                <div style={{ fontSize: '15px', fontWeight: '500' }}>Aguardando registro</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid-3" style={{ marginTop: '32px' }}>
                        <div className="card" style={{ padding: '24px' }}>
                            <div className="eyebrow" style={{ marginBottom: '20px' }}>Treinos na semana</div>
                            <div className="num" style={{ fontSize: '40px' }}>0<span style={{ color: 'var(--ink-faint)', fontWeight: '600' }}>/{diasTreino}</span></div>
                            <div style={{ marginTop: '16px', display: 'flex', gap: '5px' }}>
                                {Array.from({ length: diasTreino }).map((_, i) => (
                                    <span key={i} style={{ height: '6px', flex: '1', borderRadius: '3px', background: 'var(--line)' }}></span>
                                ))}
                            </div>
                        </div>
                        <div className="card" style={{ padding: '24px' }}>
                            <div className="eyebrow" style={{ marginBottom: '20px' }}>Sequência</div>
                            <div className="num" style={{ fontSize: '40px' }}>0 <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--ink-soft)' }}>dias</span></div>
                            <div style={{ marginTop: '18px', fontSize: '13px', color: 'var(--ink-muted)' }}>Registre o treino de hoje para começar.</div>
                        </div>
                        <div className="card" style={{ padding: '24px' }}>
                            <div className="eyebrow" style={{ marginBottom: '20px' }}>Meta calórica</div>
                            <div className="num" style={{ fontSize: '40px' }}>{dieta?.metaCalorica || 0} <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--ink-soft)' }}>kcal</span></div>
                            <div style={{ marginTop: '18px', fontSize: '13px', color: 'var(--ink-muted)' }}>
                                {dieta?.objetivo || "Manter"} · {dieta?.macros?.proteinaG}P / {dieta?.macros?.carboG}C / {dieta?.macros?.gorduraG}G
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px' }}>
                        <MissoesDoDia onComplete={(m) => console.log('Missao completada', m)} />
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        <Liga isLeader={isProUser} leagueName="Sua Liga" userName={apelido} />
                        <EvoDashboard isProUser={isProUser} userName={apelido} />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
