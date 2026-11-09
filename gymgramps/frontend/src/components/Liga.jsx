import React, { useState, useEffect } from 'react';

// Simulamos o estado zerado para recepção de novos usuários na liga
const getInitialPeople = (userName) => [
    { id: 'me', name: userName, initials: (userName || 'V')[0].toUpperCase(), gg: 0, season: 0, delta: 0, streak: 0, status: 'Pronto para treinar', trend: [0, 0, 0, 0, 0, 0, 0], you: true }
];

const basePosts = [];

export default function Liga({ leagueName = 'Sua Liga', isLeader = true, userName = 'Você' }) {
    const PEOPLE = getInitialPeople(userName);
    const isEmptyLeague = PEOPLE.length === 1;

    const [tab, setTab] = useState('semana');
    const [inviteOpen, setInviteOpen] = useState(isEmptyLeague);
    const [copied, setCopied] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [kudos, setKudos] = useState({});
    const [nudged, setNudged] = useState({});
    const [challenged, setChallenged] = useState({});
    const [duelStatus, setDuelStatus] = useState(isEmptyLeague ? 'sem_duelo' : 'ativo');
    const [toastMsg, setToastMsg] = useState('');
    const [draft, setDraft] = useState('');
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (toastMsg) {
            const t = setTimeout(() => setToastMsg(''), 2600);
            return () => clearTimeout(t);
        }
    }, [toastMsg]);

    const say = (msg) => {
        setToastMsg(msg);
    };

    const spark = (trend) => {
        const min = Math.min(...trend), max = Math.max(...trend), span = Math.max(1, max - min);
        return trend.map((v, i) => `${(i / (trend.length - 1)) * 68},${24 - ((v - min) / span) * 22}`).join(' ');
    };

    const sorted = () => {
        const key = tab === 'temporada' ? 'season' : 'gg';
        let list = PEOPLE.slice();
        if (tab === 'amigos') list = list.filter(p => p.friend || p.you);
        return list.sort((a, b) => b[key] - a[key]);
    };

    const list = sorted();
    const weekly = PEOPLE.slice().sort((a, b) => b.gg - a.gg);
    const you = PEOPLE.find(p => p.you);
    const yourRank = weekly.findIndex(p => p.you) + 1;
    const showZones = tab !== 'amigos';

    const podiumOrder = isEmptyLeague ? [null, weekly[0], null] : [weekly[1], weekly[0], weekly[2]];
    const podium = podiumOrder.map((p, idx) => {
        if (!p) return null;
        const place = isEmptyLeague ? 1 : weekly.indexOf(p) + 1;
        const first = place === 1;
        return {
            id: p.id,
            initials: p.initials,
            name: p.you ? `${p.name} (você)` : p.name,
            subline: p.streak > 0 ? `${p.streak} dias seguidos` : 'sem sequência',
            place: `${place}º`,
            gg: p.gg,
            height: first ? '196px' : place === 2 ? '150px' : '122px',
            blockBg: first ? 'var(--lime)' : 'color-mix(in srgb, var(--ink) 8%, transparent)',
            blockLine: first ? 'var(--lime)' : 'color-mix(in srgb, var(--ink) 18%, transparent)',
            numInk: first ? 'var(--ink)' : 'var(--brand-on)',
            ggInk: first ? 'rgba(22,24,15,0.7)' : 'rgba(239,235,225,0.6)',
            avatarBg: first ? 'var(--lime)' : 'color-mix(in srgb, var(--ink) 12%, transparent)',
            avatarInk: first ? 'var(--ink)' : 'var(--brand-on)',
            ringColor: p.you ? 'var(--lime)' : 'transparent'
        };
    });

    const rows = list.map((p, i) => {
        const rank = i + 1;
        const promo = showZones && rank === 1;
        const drop = showZones && rank === list.length - 1;
        const isNudged = nudged[p.id];
        return {
            id: p.id,
            rank,
            name: p.you ? `${p.name} (você)` : p.name,
            initials: p.initials,
            tag: p.you ? 'Você' : (rank === 1 ? 'Líder' : ''),
            status: p.status,
            streak: p.streak,
            streakInk: p.streak >= 6 ? 'var(--accent)' : p.streak > 0 ? 'var(--ink-muted)' : 'var(--ink-faint)',
            gg: tab === 'temporada' ? p.season : p.gg,
            deltaLabel: p.delta === 0 ? '=' : (p.delta > 0 ? `+${p.delta}` : `${p.delta}`),
            deltaInk: p.delta > 0 ? 'var(--accent)' : p.delta < 0 ? 'var(--danger)' : 'var(--ink-faint)',
            spark: spark(p.trend),
            sparkInk: p.delta >= 0 ? 'var(--accent)' : 'var(--danger)',
            rowBg: p.you ? 'var(--chip)' : 'transparent',
            rowHoverBg: p.you ? 'var(--chip)' : 'var(--surface-2)',
            rankInk: rank <= 3 ? 'var(--brand)' : 'var(--ink-muted)',
            avatarBg: p.you ? 'var(--brand)' : 'var(--bg)',
            avatarInk: p.you ? 'var(--lime)' : 'var(--ink-soft)',
            canAct: !p.you,
            actLabel: isNudged ? 'Cutucado' : 'Cutucar',
            onAct: () => {
                setNudged(s => ({ ...s, [p.id]: true }));
                say(`Cutucada enviada para ${p.name}.`);
            },
            zoneLabel: promo ? 'Sobe para Diamante' : drop ? 'Zona de queda para Prata' : '',
            zoneInk: promo ? 'var(--accent)' : 'var(--danger)',
            zoneLine: promo ? '#CFE0A8' : '#E7C9BE'
        };
    });

    const duelMap = {
        ativo: {
            note: 'Você está 6 GG na frente. Faltam dois treinos para fechar a semana.',
            primaryLabel: 'Registrar treino agora',
            secondaryLabel: 'Desistir',
            onPrimary: () => say('Treino registrado · +12 GG no duelo.'),
            onSecondary: () => { setDuelStatus('encerrado'); say('Duelo encerrado. Carlos leva 25 pontos.'); }
        },
        encerrado: {
            note: 'Duelo encerrado. Você pode desafiar outra pessoa da liga quando quiser.',
            primaryLabel: 'Novo duelo',
            secondaryLabel: 'Histórico',
            onPrimary: () => { setDuelStatus('ativo'); say('Novo duelo aberto com Carlos.'); },
            onSecondary: () => say('3 duelos disputados · 2 vitórias.')
        },
        sem_duelo: {
            note: 'Convide amigos para a liga para habilitar os duelos 1x1 da semana.',
            primaryLabel: 'Convidar amigos',
            secondaryLabel: 'Como funciona',
            onPrimary: () => { setInviteOpen(true); },
            onSecondary: () => say('Aposte 25 GG com alguém para ver quem treina melhor na semana.')
        }
    }[duelStatus];

    const duel = isEmptyLeague ? {
        left: 'Aguardando amigos',
        youInitials: PEOPLE[0].initials,
        youScore: 0,
        rivalInitials: '?',
        rivalName: 'Amigo',
        rivalScore: 0,
        youPct: '0%',
        ...duelMap
    } : {
        left: duelStatus === 'ativo' ? 'termina em 2d 14h' : 'encerrado',
        youInitials: you.initials,
        youScore: you.gg,
        rivalInitials: 'C',
        rivalName: 'Carlos',
        rivalScore: 78,
        youPct: '52%',
        ...duelMap
    };

    const kindStyle = {
        'Recorde': ['var(--brand)', 'var(--chip)'],
        'Sequência': ['var(--note-ink)', 'var(--note-bg)'],
        'Precisa de apoio': ['var(--danger)', '#F7E6E0'],
        'Duelo': ['var(--ink-soft)', 'var(--brand-on)'],
        'Você': ['var(--brand)', 'var(--chip)']
    };

    const feed = [...posts, ...basePosts].map(p => {
        const on = !!kudos[p.id];
        const style = kindStyle[p.kind] || kindStyle['Duelo'];
        return {
            ...p,
            kindInk: style[0], kindBg: style[1],
            avatarBg: p.mine ? 'var(--brand)' : 'var(--bg)',
            avatarInk: p.mine ? 'var(--lime)' : 'var(--ink-soft)',
            kudosCount: p.kudos + (on ? 1 : 0),
            kudosBg: on ? 'var(--lime)' : 'var(--surface-2)',
            kudosInk: on ? 'var(--ink)' : 'var(--ink-soft)',
            kudosLine: on ? 'var(--lime)' : 'var(--line)',
            onKudos: () => setKudos(s => ({ ...s, [p.id]: !s[p.id] })),
            nudgeLabel: nudged[p.id] ? 'Comentado' : 'Comentar',
            onNudge: () => { setNudged(s => ({ ...s, [p.id]: true })); say(`Abrindo conversa com ${p.name}.`); }
        };
    });

    const challengeable = PEOPLE.filter(p => !p.you && p.friend).slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        initials: p.initials,
        form: `${p.gg} GG · ${p.delta >= 0 ? '+' : ''}${p.delta} esta semana`,
        label: challenged[p.id] ? 'Enviado' : 'Desafiar',
        onChallenge: () => {
            setChallenged(s => ({ ...s, [p.id]: true }));
            say(`Desafio de uma semana enviado para ${p.name}.`);
        }
    }));

    const postDraft = () => {
        const text = draft.trim();
        if (!text) return say('Escreva algo antes de publicar.');
        setDraft('');
        setPosts([{ id: 'me' + Date.now(), name: `${userName} (você)`, initials: (userName || 'V')[0].toUpperCase(), kind: 'Você', time: 'agora', text, kudos: 0, replies: 0, mine: true }, ...posts]);
        say('Publicado no mural da liga.');
    };

    const inviteCode = 'ouro-4f2a';
    const copyInvite = () => {
        if (navigator.clipboard) navigator.clipboard.writeText(`https://gymgramps.app/liga/${inviteCode}`).catch(() => { });
        setCopied(true);
        say('Link copiado. Quem entrar começa a pontuar na próxima semana.');
    };

    const mission = isEmptyLeague ? {
        title: 'Complete o primeiro treino',
        done: 0,
        goal: 1,
        pct: '0%',
        reward: 'Missão cumprida: +15 GG de boas vindas e desbloqueio oficial da liga.',
        contributors: []
    } : {
        title: '40 treinos da liga até domingo',
        done: 27,
        goal: 40,
        pct: '67%',
        reward: 'Missão cumprida: todo mundo da liga ganha +15 GG e o emblema da semana.',
        contributors: PEOPLE.slice(0, 6).map((p, i) => ({ id: p.id, initials: p.initials, count: 6 - i }))
    };

    const ruleList = [
        { pts: '+12', what: 'treino registrado dentro do plano da semana' },
        { pts: '+6', what: 'dia com as refeições e a meta calórica batidas' },
        { pts: '+4', what: 'cada dia de sequência mantido, até 7 por semana' },
        { pts: '+25', what: 'vitória em duelo 1 × 1' },
        { pts: '−8', what: 'treino planejado que ficou sem registro' }
    ];

    return isEmptyLeague ? (
        <section className="dashboard-section liga-section" style={{ background: 'none', marginTop: '32px' }}>
            <div style={{ background: 'var(--brand)', color: 'var(--brand-on)', borderRadius: '32px', padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--brand)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--lime)', filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none', borderRadius: '50%' }}></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '16px' }}>Comunidade GG</div>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '42px', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Comece a sua Liga</h2>
                <p style={{ fontSize: '16px', maxWidth: '440px', lineHeight: 1.6, margin: '0 0 32px', color: 'rgba(239,235,225,0.85)' }}>
                    Treinar de forma solitária funciona, mas a consistência explode quando há responsabilidade social. Convide amigos para competir semanalmente no seu ranking da Divisão.
                </p>
                <button onClick={() => setInviteOpen(true)} style={{ border: 'none', borderRadius: '999px', background: 'var(--lime)', color: 'var(--ink)', fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 700, padding: '18px 36px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(212,255,0,0.15)', transition: 'all 0.2s' }}>
                    <span>Convidar amigos agora</span>
                    <span style={{ fontSize: '18px' }}>→</span>
                </button>
            </div>
            {inviteOpen && (
                <div className="modal-overlay" onClick={() => setInviteOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(5,6,6,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, animation: 'fadeIn .25s ease' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '32px', width: '100%', maxWidth: '440px', padding: '36px', position: 'relative', overflow: 'hidden', textAlign: 'left', color: 'var(--ink)' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--brand)' }}></div>
                        <button onClick={() => setInviteOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 0, fontSize: '20px', color: 'var(--ink-muted)', cursor: 'pointer' }}>×</button>
                        <h3 style={{ margin: '0 0 8px', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Convide amigos</h3>
                        <p style={{ margin: '0 0 24px', fontSize: '15.5px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>Mande esse link para sua academia ou grupo. Quem entrar nessa semana inaugura a liga oficial junto com você.</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1, background: 'var(--field)', border: '1px solid var(--line)', borderRadius: '14px', padding: '14px 18px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>gymgramps.app/l/{you.id.substring(0, 5)}</div>
                            <button onClick={copyInvite} style={{ border: 0, borderRadius: '14px', background: copied ? 'var(--brand)' : 'var(--ink)', color: copied ? 'var(--brand-on)' : 'var(--bg)', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, padding: '0 24px', cursor: 'pointer', transition: 'all .25s' }}>
                                {copied ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    ) : (
        <div style={{ marginTop: '24px', fontFamily: "'DM Sans', sans-serif", color: 'var(--ink)' }}>

            {/* CABEÇALHO */}
            <div style={{ padding: '0 0 30px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Comunidade</span>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--line-faint)' }}></span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>Divisão Ouro</span>
                    </div>
                    <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '52px', lineHeight: 0.98, fontWeight: 800, letterSpacing: '-0.04em' }}>{leagueName}</h1>
                    <p style={{ margin: '14px 0 0', fontSize: '15px', lineHeight: 1.55, color: 'var(--ink-soft)', maxWidth: '52ch', textWrap: 'pretty' }}>{isEmptyLeague ? 'Treine com amigos. Cada treino, refeição batida e dia de sequência vira Score GG — o ranking fecha domingo à noite.' : '8 pessoas treinando na mesma divisão. Cada treino, refeição batida e dia de sequência vira Score GG — o ranking fecha domingo à noite.'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right', marginRight: '8px' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '6px' }}>Fecha em</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>2d 14h</div>
                    </div>
                    <button onClick={() => { setInviteOpen(!inviteOpen); setCopied(false); }} className="liga-btn-green" style={{ border: 0, borderRadius: '999px', background: 'var(--brand)', color: 'var(--brand-on)', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, padding: '13px 22px', cursor: 'pointer' }}>Convidar amigos</button>
                </div>
            </div>

            {inviteOpen && (
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '18px', padding: '22px 24px', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Seu link de convite</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--ink-soft)', background: 'var(--bg)', border: '1px dashed var(--line-faint)', borderRadius: '10px', padding: '10px 14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>gymgramps.app/liga/{inviteCode}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={copyInvite} style={{ border: 0, borderRadius: '999px', background: 'var(--lime)', color: 'var(--ink)', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700, padding: '12px 20px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{copied ? 'Link copiado' : 'Copiar link'}</button>
                        <button onClick={() => setInviteOpen(false)} style={{ border: '1px solid var(--line)', borderRadius: '999px', background: 'none', color: 'var(--ink-soft)', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 500, padding: '12px 18px', cursor: 'pointer' }}>Fechar</button>
                    </div>
                </div>
            )}
            {/* PÓDIO */}
            <section style={{ background: 'var(--brand)', color: 'var(--brand-on)', borderRadius: '22px', padding: '34px 40px 0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--lime)' }}></span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lime)' }}>Ao vivo · atualizado há 4 min</span>
                        </div>
                        <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '30px', fontWeight: 600, letterSpacing: '-0.03em' }}>Pódio da semana</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '34px', paddingTop: '6px' }}>
                        {isEmptyLeague ? (
                            <div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(239,235,225,0.55)', marginBottom: '6px' }}>Placar</div>
                                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>0 GG</div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(239,235,225,0.55)', marginBottom: '6px' }}>Sua posição</div>
                                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{yourRank}º de {PEOPLE.length}</div>
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(239,235,225,0.55)', marginBottom: '6px' }}>Para o 1º lugar</div>
                                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--lime)' }}>+{weekly[0].gg - you.gg} GG</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isEmptyLeague ? '1fr' : '1fr 1.15fr 1fr', gap: '18px', alignItems: 'end', marginTop: '40px' }}>
                    {isEmptyLeague && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '20px auto 40px', maxWidth: '300px' }}>
                            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '19px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '8px' }}>Pódio Vazio</div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(239,235,225,0.55)', marginBottom: '16px', lineHeight: 1.6 }}>Convide seus primeiros amigos para inaugurar a tabela e competir no Top 3.</div>
                            <button onClick={() => { setInviteOpen(true); }} className="liga-btn-green" style={{ border: 0, borderRadius: '999px', background: 'var(--lime)', color: 'var(--ink)', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700, padding: '12px 22px', cursor: 'pointer' }}>Convidar amigos</button>
                        </div>
                    )}
                    {!isEmptyLeague && podium.map((p, idx) => p && (
                        <div key={p.id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: '62px', height: '62px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 600, marginBottom: '12px', background: p.avatarBg, color: p.avatarInk, border: `2px solid ${p.ringColor}` }}>{p.initials}</div>
                            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '19px', fontWeight: 600, letterSpacing: '-0.02em' }}>{p.name}</div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(239,235,225,0.55)', margin: '6px 0 14px' }}>{p.subline}</div>
                            <div style={{ width: '100%', borderRadius: '16px 16px 0 0', background: p.blockBg, border: `1px solid ${p.blockLine}`, borderBottom: 0, height: p.height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '46px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: p.numInk }}>{p.place}</div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600, color: p.ggInk }}>{p.gg} GG</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CORPO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: '14px', marginTop: '14px', alignItems: 'start' }}>

                {/* ESQUERDA: RANKING */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '22px', overflow: 'hidden' }}>
                    <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Classificação</div>
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '999px', padding: '3px' }}>
                            {[{ key: 'semana', label: 'Semana' }, { key: 'temporada', label: 'Temporada' }, { key: 'amigos', label: 'Amigos' }].map(t => (
                                <button key={t.key} onClick={() => setTab(t.key)} style={{ border: 0, borderRadius: '999px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, padding: '8px 16px', cursor: 'pointer', background: tab === t.key ? 'var(--brand)' : 'transparent', color: tab === t.key ? 'var(--bg)' : 'var(--ink-soft)' }}>{t.label}</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        {rows.map((m) => (
                            <div key={m.id}>
                                {m.zoneLabel && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 26px', background: 'var(--bg)' }}>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: m.zoneInk }}>{m.zoneLabel}</span>
                                        <span style={{ flex: 1, height: '1px', background: m.zoneLine }}></span>
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '34px 44px minmax(0, 1fr) auto auto auto', gap: '14px', alignItems: 'center', padding: '16px 26px', borderBottom: '1px solid var(--line-soft)', background: m.rowBg }}>
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', fontWeight: 600, color: m.rankInk }}>{m.rank}º</div>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 600, background: m.avatarBg, color: m.avatarInk }}>{m.initials}</div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                                            {m.tag && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--chip)', color: 'var(--brand)', borderRadius: '5px', padding: '3px 6px' }}>{m.tag}</span>}
                                        </div>
                                        <div style={{ fontSize: '12.5px', color: 'var(--ink-muted)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.status}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: m.streakInk }}>
                                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: m.streakInk }}></span>{m.streak}d
                                    </div>
                                    <svg viewBox="0 0 68 26" width="68" height="26" aria-hidden="true" style={{ overflow: 'visible' }}>
                                        <polyline points={m.spark} fill="none" stroke={m.sparkInk} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"></polyline>
                                    </svg>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'flex-end' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>{m.gg}</div>
                                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: m.deltaInk, marginTop: '4px' }}>{m.deltaLabel}</div>
                                        </div>
                                        {m.canAct && (
                                            <button onClick={m.onAct} style={{ border: '1px solid var(--line)', borderRadius: '999px', background: 'var(--surface-2)', color: 'var(--brand)', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{m.actLabel}</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '18px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '13px', color: 'var(--ink-muted)', textWrap: 'pretty' }}>Top 3 sobem para Diamante · dois últimos caem para Prata.</div>
                        <button onClick={() => setRulesOpen(!rulesOpen)} style={{ border: 0, background: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--accent)', padding: 0, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Como o Score GG é calculado</button>
                    </div>
                    {rulesOpen && (
                        <div style={{ margin: '0 26px 24px', background: 'var(--note-bg)', border: '1px solid var(--note-line)', borderRadius: '14px', padding: '18px 20px' }}>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {ruleList.map((r, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '12px', fontSize: '13.5px', color: 'var(--ink)' }}>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600, color: 'var(--note-ink)', minWidth: '52px' }}>{r.pts}</span>
                                        <span>{r.what}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* DIREITA */}
                <div style={{ display: 'grid', gap: '14px' }}>
                    {/* DUELO */}
                    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '22px', padding: '24px 26px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Duelo 1 × 1</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--danger)' }}>{duel.left}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--brand)', color: 'var(--lime)', display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600 }}>{duel.youInitials}</div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Você</div>
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--ink-soft)' }}>{duel.youScore} GG</div>
                                </div>
                            </div>
                            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '15px', fontWeight: 800, color: 'var(--ink-faint)' }}>VS</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexDirection: 'row-reverse' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--chip)', color: 'var(--brand)', display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600 }}>{duel.rivalInitials}</div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{duel.rivalName}</div>
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--ink-soft)' }}>{duel.rivalScore} GG</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '18px', height: '10px', borderRadius: '999px', background: 'var(--chip)', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ height: '100%', background: 'var(--brand)', width: duel.youPct }}></div>
                            <div style={{ height: '100%', background: '#D9A54C', flex: 1 }}></div>
                        </div>
                        <div style={{ marginTop: '14px', fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.5, textWrap: 'pretty' }}>{duel.note}</div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <button onClick={duel.onPrimary} style={{ flex: 1, border: 0, borderRadius: '999px', background: 'var(--lime)', color: 'var(--ink)', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 700, padding: '12px 16px', cursor: 'pointer' }}>{duel.primaryLabel}</button>
                            <button onClick={duel.onSecondary} style={{ border: '1px solid var(--line)', borderRadius: '999px', background: 'none', color: 'var(--ink-soft)', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 500, padding: '12px 16px', cursor: 'pointer' }}>{duel.secondaryLabel}</button>
                        </div>
                    </div>

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '22px', padding: '24px 26px' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '14px' }}>Missão da liga</div>
                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{mission.title}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0 10px' }}>
                            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '34px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{mission.done}</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: 'var(--ink-muted)' }}>/ {mission.goal} treinos</span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '999px', background: 'var(--line)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--accent)', width: mission.pct }}></div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
                            {mission.contributors.map(c => (
                                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '999px', padding: '5px 10px 5px 5px' }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--brand)', color: 'var(--brand-on)', display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>{c.initials}</span>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--ink-soft)' }}>{c.count}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.5, textWrap: 'pretty' }}>{mission.reward}</div>
                    </div>

                    <div style={{ background: 'var(--brand)', color: 'var(--brand-on)', borderRadius: '22px', padding: '24px 26px' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '14px' }}>Nova conquista</div>
                        {isEmptyLeague && (
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--brand-on)' }}>Inaugure seu progresso</div>
                        )}
                        {!isEmptyLeague && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--lime)', color: 'var(--ink)', display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', fontWeight: 600 }}>12d</div>
                                    <div>
                                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Sequência de duas semanas</div>
                                        <div style={{ fontSize: '13px', color: 'rgba(239,235,225,0.65)', marginTop: '4px' }}>Só 2 pessoas da liga têm essa.</div>
                                    </div>
                                </div>
                                <button onClick={() => say('Conquista publicada no mural da liga.')} style={{ width: '100%', marginTop: '18px', border: '1px solid rgba(239,235,225,0.28)', borderRadius: '999px', background: 'none', color: 'var(--brand-on)', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600, padding: '12px 16px', cursor: 'pointer' }}>Compartilhar na liga</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* MURAL */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: '14px', marginTop: '14px', alignItems: 'start' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '22px', overflow: 'hidden' }}>
                    <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Mural da liga</div>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>{feed.length} atualizações hoje</span>
                    </div>

                    <div style={{ padding: '18px 26px', borderBottom: '1px solid var(--line-soft)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand)', color: 'var(--lime)', display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>{duel.youInitials}</div>
                        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && postDraft()} placeholder="Escreva algo para a liga…" style={{ flex: 1, minWidth: 0, border: '1px solid var(--line)', borderRadius: '999px', background: 'var(--surface-2)', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--ink)', padding: '11px 16px', outline: 'none' }} />
                        <button onClick={postDraft} style={{ border: 0, borderRadius: '999px', background: 'var(--brand)', color: 'var(--brand-on)', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600, padding: '11px 18px', cursor: 'pointer' }}>Publicar</button>
                    </div>

                    {feed.length === 0 && (
                        <div style={{ padding: '32px 26px', textAlign: 'center', color: 'var(--ink-muted)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '14px', color: 'var(--line-soft)' }}>💬</div>
                            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '17px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '8px' }}>O mural está vazio</div>
                            <div style={{ fontSize: '13.5px', maxWidth: '32ch', margin: '0 auto', lineHeight: 1.5 }}>As conquistas e check-ins seus e de seus amigos aparecerão aqui.</div>
                        </div>
                    )}
                    {feed.length > 0 && (
                        <div>
                            {feed.map(f => (
                                <div key={f.id} style={{ padding: '20px 26px', borderBottom: '1px solid var(--line-soft)', display: 'grid', gridTemplateColumns: '40px minmax(0, 1fr)', gap: '14px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 600, background: f.avatarBg, color: f.avatarInk }}>{f.initials}</div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '14.5px', fontWeight: 700 }}>{f.name}</span>
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: f.kindInk, background: f.kindBg, borderRadius: '5px', padding: '3px 6px' }}>{f.kind}</span>
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--ink-faint)' }}>{f.time}</span>
                                        </div>
                                        <div style={{ fontSize: '14.5px', lineHeight: 1.55, color: 'var(--ink-2)', marginTop: '6px', textWrap: 'pretty' }}>{f.text}</div>
                                        {f.metric && (
                                            <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '8px', marginTop: '12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', padding: '10px 14px' }}>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' }}>{f.metric}</span>
                                                <span style={{ fontSize: '12.5px', color: 'var(--ink-muted)' }}>{f.metricLabel}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                                            <button onClick={f.onKudos} style={{ display: 'flex', alignItems: 'center', gap: '7px', border: `1px solid ${f.kudosLine}`, borderRadius: '999px', background: f.kudosBg, color: f.kudosInk, fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, padding: '7px 14px', cursor: 'pointer' }}>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>+1</span>Força
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', opacity: 0.7 }}>{f.kudosCount}</span>
                                            </button>
                                            <button onClick={f.onNudge} style={{ border: '1px solid var(--line)', borderRadius: '999px', background: 'none', color: 'var(--ink-soft)', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, padding: '7px 14px', cursor: 'pointer' }}>{f.nudgeLabel}</button>
                                            {f.replies > 0 && <span style={{ display: 'flex', alignItems: 'center', fontSize: '12.5px', color: 'var(--ink-muted)', padding: '7px 4px' }}>{f.replies} comentários</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* LATERAL DIREITA: DESAFIOS E LÍDER */}
                <div style={{ display: 'grid', gap: '14px' }}>
                    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '22px', padding: '24px 26px' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '6px' }}>Desafiar alguém</div>
                        <div style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '18px', textWrap: 'pretty' }}>Aposta de uma semana. Quem fizer mais Score GG leva 25 pontos do outro.</div>
                        {isEmptyLeague && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 0', color: 'var(--ink-muted)' }}>
                                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '16px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Ninguém para desafiar</div>
                                <div style={{ fontSize: '13px', lineHeight: 1.5, marginTop: '6px' }}>Convide alguém para a liga usando o botão de convite para habilitar desafios.</div>
                            </div>
                        )}
                        {!isEmptyLeague && (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {challengeable.map(c => (
                                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '14px', background: 'var(--surface)' }}>
                                        <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--chip)', color: 'var(--brand)', display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600 }}>{c.initials}</span>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--ink-muted)' }}>{c.form}</div>
                                        </div>
                                        <button onClick={c.onChallenge} style={{ border: 0, borderRadius: '999px', background: 'var(--chip)', color: 'var(--brand)', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 700, padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{c.label}</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {isLeader && (
                        <div style={{ background: 'var(--note-bg)', border: '1px solid var(--note-line)', borderRadius: '22px', padding: '24px 26px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--note-ink)' }}>Líder da liga</span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--brand)', color: 'var(--lime)', borderRadius: '5px', padding: '3px 6px' }}>Pro</span>
                            </div>
                            <div style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.55, marginBottom: '16px', textWrap: 'pretty' }}>Você define a missão da semana, aprova entradas e pode silenciar ou remover participantes.</div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <button onClick={() => say('Abrindo painel de participantes.')} style={{ border: 0, borderRadius: '999px', background: 'var(--brand)', color: 'var(--brand-on)', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600, padding: '12px 16px', cursor: 'pointer' }}>Gerenciar participantes</button>
                                <button onClick={() => say('Escolha a missão da próxima semana.')} style={{ border: '1px solid var(--note-line)', borderRadius: '999px', background: 'none', color: 'var(--note-ink)', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', fontWeight: 600, padding: '12px 16px', cursor: 'pointer' }}>Definir nova missão</button>
                            </div>
                            <div style={{ marginTop: '14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--note-ink)' }}>2 pedidos de entrada aguardando</div>
                        </div>
                    )}
                </div>
            </div>

            {/* TOAST NOTIFICATION */}
            {toastMsg && (
                <div style={{ position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'var(--brand-on)', borderRadius: '999px', padding: '13px 24px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 500, boxShadow: '0 12px 32px rgba(22,24,15,0.24)', zIndex: 60 }}>
                    {toastMsg}
                </div>
            )}
        </div>
    );
}
