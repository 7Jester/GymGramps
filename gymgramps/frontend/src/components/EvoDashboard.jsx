import React, { useState, useEffect, useRef } from 'react';

const EVO_WEEKS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12'];
const fmt = (v, d) => (v || 0).toFixed(d).replace('.', ',');

export default function EvoDashboard({ isProUser = false, userName = 'Atleta' }) {
    const [proMode, setProMode] = useState(isProUser || (localStorage.getItem('gg-pro') === '1'));
    // FORCE_EMPTY_STATE garante que os dados mokados no backend não sujem a view final do usuário antes de ele registrar os treinos.
    const FORCE_EMPTY_STATE = true;

    const [selectedMetricId, setSelectedMetricId] = useState('carga');
    const [metrics, setMetrics] = useState([]);
    const [indiceData, setIndiceData] = useState(null);
    const [deltas, setDeltas] = useState([]);
    const [marksData, setMarksData] = useState(null);

    const [hoverIndex, setHoverIndex] = useState(null);
    const chartRef = useRef(null);

    useEffect(() => {
        setProMode(isProUser || (localStorage.getItem('gg-pro') === '1'));
    }, [isProUser]);

    useEffect(() => {
        // Fetch data from backend
        const fetchData = async () => {
            try {
                const [resSeries, resInd, resDelt, resMarks] = await Promise.all([
                    fetch('http://localhost:3000/api/evolucao/series?semanas=12'),
                    fetch('http://localhost:3000/api/evolucao/indice'),
                    fetch('http://localhost:3000/api/evolucao/deltas'),
                    fetch('http://localhost:3000/api/evolucao/marcos')
                ]);
                const datSeries = await resSeries.json();
                const datInd = await resInd.json();
                const datDelt = await resDelt.json();
                const datMarks = await resMarks.json();

                if (datSeries.success) setMetrics(datSeries.series);
                if (datInd.success) setIndiceData(datInd);
                if (datDelt.success) setDeltas(datDelt.deltas);
                if (datMarks.success) setMarksData(datMarks);

            } catch (err) {
                console.error('Error loading evolucao data', err);
            }
        };
        fetchData();
    }, []);

    const togglePro = (override) => {
        const val = typeof override === 'boolean' ? override : !proMode;
        setProMode(val);
        localStorage.setItem('gg-pro', val ? '1' : '0');
    };

    const getMetricData = () => metrics.find(m => m.id === selectedMetricId);
    const metric = getMetricData();

    const handlePointerMove = (e) => {
        if (!chartRef.current || !metric || !metric.data) return;
        const r = chartRef.current.getBoundingClientRect();
        const W = 760;
        const PL = 46;
        const PR = 8;
        const rel = (e.clientX - r.left) / r.width * W;
        let i = Math.round((rel - PL) / ((W - PL - PR) / (metric.data.length - 1)));
        i = Math.max(0, Math.min(metric.data.length - 1, i));
        setHoverIndex(i);
    };

    const getChartElements = () => {
        if (!metric || !metric.data) return null;
        const W = 760, H = 210, PL = 46, PR = 8, PT = 14, PB = 8;
        const isChartEmpty = FORCE_EMPTY_STATE || !metric || !metric.data || metric.data.every(v => v === 0);

        if (isChartEmpty) {
            return {
                W, H, PL, PR, PT, PB,
                min: 0, max: 10,
                x: i => PL + i * (W - PL - PR) / 11,
                y: () => H - PB,
                pts: Array(12).fill([0, H - PB]).map((_, i) => [PL + i * (W - PL - PR) / 11, H - PB]),
                line: `M${PL} ${H - PB} L${W - PR} ${H - PB}`,
                area: `M${PL} ${H - PB} L${W - PR} ${H - PB} Z`,
                ticks: [0, 5, 10],
                empty: true
            };
        }

        const d = metric.data;
        const lo = Math.min(...d), hi = Math.max(...d);
        const pad = (hi - lo) * 0.35 || 1;
        const min = lo - pad, max = hi + pad;
        const x = i => PL + i * (W - PL - PR) / (d.length - 1);
        const y = v => PT + (1 - (v - min) / (max - min)) * (H - PT - PB);
        const pts = d.map((v, i) => [x(i), y(v)]);
        const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        const area = line + ` L${x(d.length - 1).toFixed(1)} ${H - PB} L${PL} ${H - PB} Z`;
        const ticks = [0, 1, 2, 3].map(k => min + (max - min) * k / 3);

        return { W, H, PL, PR, PT, PB, min, max, x, y, pts, line, area, ticks };
    };

    const chartInfo = getChartElements();

    if (!indiceData || metrics.length === 0) return null; // loading state essentially handled by returning transparently

    const diff = metric && metric.data && chartInfo && !chartInfo.empty ? metric.data[metric.data.length - 1] - metric.data[0] : 0;
    const baseValue = metric && metric.data ? metric.data[0] || 1 : 1;
    const pctd = chartInfo && !chartInfo.empty ? (diff / baseValue * 100).toFixed(0) : 0;
    const deltaText = chartInfo && !chartInfo.empty
        ? ((diff >= 0 ? '+' : '−') + fmt(Math.abs(diff), metric.dec) + ' ' + metric.unit + ' (' + (diff >= 0 ? '+' : '−') + Math.abs(pctd) + '%)')
        : 'Início de jornada';

    return (
        <div style={{ marginTop: '24px' }}>
            <div className="section-head">
                <h3>Sua trajetória<span className="pro-tag">Pro</span></h3>
                {!isProUser && (
                    <button className="link-sm as-btn" onClick={() => togglePro()}>
                        {proMode ? 'Ocultar prévia' : 'Ver como assinante'}
                    </button>
                )}
            </div>

            <section className={`evo ${proMode ? 'unlocked' : 'locked'}`} id="evo">
                <div className="evo-inner">

                    {/* CABEÇALHO */}
                    {FORCE_EMPTY_STATE ? (
                        <div className="evo-head">
                            <svg className="ring" viewBox="0 0 100 100">
                                <circle className="bg" cx="50" cy="50" r="42" />
                                <circle className="fg" cx="50" cy="50" r="42" style={{ strokeDashoffset: `${264 - (264 * 0) / 100}` }} />
                            </svg>
                            <div className="score">
                                <span className="num">0</span>
                                <span className="lbl">Índice GG</span>
                            </div>
                            <div className="summary">
                                <div className="s-eyebrow">Aguardando Avaliação</div>
                                <h1 className="s-title">Inicie sua jornada para ver resultados.</h1>
                                <p className="s-desc">
                                    Seus relatórios e gargalos da semana aparecerão aqui conforme você registra seus treinos e refeições. Mantenha a consistência.
                                </p>
                                <div className="bars">
                                    {['Consistência', 'Sobrecarga', 'Nutrição', 'Recuperação'].map(bar => (
                                        <div className="bar-group" key={bar}>
                                            <div className="b-head">
                                                <span>{bar}</span>
                                                <span>0%</span>
                                            </div>
                                            <div className="b-track"><div className="b-fill" style={{ width: '0%' }}></div></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="evo-head">
                            <svg className="ring" viewBox="0 0 100 100">
                                <circle className="bg" cx="50" cy="50" r="42" />
                                <circle className="fg" cx="50" cy="50" r="42" style={{ strokeDashoffset: `${264 - (264 * indiceData.gg) / 100}` }} />
                            </svg>
                            <div className="score">
                                <span className="num">{indiceData.gg}</span>
                                <span className="lbl">Índice GG</span>
                            </div>
                            <div className="summary">
                                <div className="s-eyebrow">Leitura da Semana 12</div>
                                <h1 className="s-title">{indiceData.title}</h1>
                                <p className="s-desc" dangerouslySetInnerHTML={{ __html: indiceData.desc }}></p>
                                <div className="bars">
                                    {indiceData.bars.map((b, i) => (
                                        <div className="bar-group" key={i}>
                                            <div className="b-head">
                                                <span>{b.l}</span>
                                                <span style={{ color: b.c === 'var(--chalk)' ? 'var(--alert)' : '' }}>{b.v}</span>
                                            </div>
                                            <div className="b-track"><div className="b-fill" style={{ width: b.p, background: b.c }}></div></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="evo-chart-block">
                        <div className="evo-chart-head">
                            <div>
                                <div className="evo-metric-name" id="evo-mname">{metric ? metric.label : 'Progresso'} · aguardando registros</div>
                                <div className="evo-metric-val">
                                    <span className="mono" id="evo-mval">{!isChartEmpty ? fmt(metric.data[metric.data.length - 1], metric.dec) : '0'} {metric ? metric.unit : ''}</span>
                                    <span style={{ fontSize: '12px', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: '6px', color: 'var(--ink-soft)', marginLeft: '12px' }}>
                                        {deltaText}
                                    </span>
                                </div>
                            </div>
                            <div className="evo-tabs" id="evo-tabs">
                                {metrics.map(m => (
                                    <button key={m.id} aria-pressed={m.id === selectedMetricId} onClick={() => setSelectedMetricId(m.id)}>
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {chartInfo && (
                            <div className={`evo-chart ${hoverIndex !== null ? 'hot' : ''}`} id="evo-chart">
                                <svg viewBox={`0 0 ${chartInfo.W} ${chartInfo.H}`} preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="evoGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--lime)" stopOpacity=".34" />
                                            <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {chartInfo.ticks.map((t, index) => (
                                        <React.Fragment key={index}>
                                            <line className="evo-grid-line" x1={chartInfo.PL} x2={chartInfo.W - chartInfo.PR} y1={chartInfo.y(t).toFixed(1)} y2={chartInfo.y(t).toFixed(1)} />
                                            <text className="evo-grid-label" x="0" y={(chartInfo.y(t) + 3).toFixed(1)}>{fmt(t, metric.dec)}{metric.unit === '%' ? '%' : ''}</text>
                                        </React.Fragment>
                                    ))}
                                    <path className="evo-area" d={chartInfo.area} />
                                    <path className="evo-line" d={chartInfo.line} />

                                    <line className="evo-cursor" id="evo-cursor"
                                        x1={hoverIndex !== null ? chartInfo.x(hoverIndex) : 0}
                                        x2={hoverIndex !== null ? chartInfo.x(hoverIndex) : 0}
                                        y1={chartInfo.PT}
                                        y2={chartInfo.H - chartInfo.PB}
                                        style={{ transition: 'all 0.15s ease-out' }}
                                    />

                                    {chartInfo.pts.map((p, i) => (
                                        <circle key={i} className="evo-pt" cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r={i === metric.data.length - 1 ? 5 : 3} />
                                    ))}
                                    <rect className="evo-hit" id="evo-hit" ref={chartRef}
                                        x={chartInfo.PL} y="0" width={chartInfo.W - chartInfo.PL - chartInfo.PR} height={chartInfo.H}
                                        onPointerMove={handlePointerMove}
                                        onPointerLeave={() => setHoverIndex(null)}
                                    />
                                </svg>
                                <div className="evo-xaxis">
                                    {EVO_WEEKS.map((w, i) => <span key={i}>{w}</span>)}
                                </div>
                                <div className="evo-tip" id="evo-tip" style={{
                                    left: hoverIndex !== null ? `${(chartInfo.x(hoverIndex) / chartInfo.W * 100)}%` : '0',
                                    top: hoverIndex !== null ? `${(chartInfo.y(metric.data[hoverIndex]) / chartInfo.H * chartRef.current?.getBoundingClientRect().height)}px` : '0',
                                    opacity: hoverIndex !== null ? 1 : 0,
                                    transition: 'left 0.15s ease-out, top 0.15s ease-out, opacity 0.15s ease-out',
                                    pointerEvents: 'none'
                                }}>
                                    <b>{hoverIndex !== null ? `${fmt(metric.data[hoverIndex], metric.dec)} ${metric.unit}` : ''}</b>
                                    <span>Semana {hoverIndex !== null ? hoverIndex + 1 : ''}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="evo-bottom">
                        <div className="evo-panel">
                            <div className="eyebrow">Onde você evoluiu · 12 semanas</div>
                            {!deltas || deltas.length === 0 || FORCE_EMPTY_STATE ? (
                                <div style={{ fontSize: '13.5px', color: 'var(--ink-muted)', marginTop: '24px', lineHeight: 1.6, textAlign: 'center' }}>
                                    Ainda não há dados suficientes.<br />Continue treinando para destrancar.
                                </div>
                            ) : (
                                <div className="evo-deltas" id="evo-deltas">
                                    {deltas.map((d, i) => {
                                        const max = Math.max(d.was, d.now) * 1.08;
                                        const up = ((d.now - d.was) / d.was * 100).toFixed(0);
                                        return (
                                            <div key={i}>
                                                <div className="dlt-top"><b>{d.name}</b><i>+{up}%</i></div>
                                                <div className="dlt-bar">
                                                    <div className="dlt-was" style={{ width: `${d.was / max * 100}%` }}></div>
                                                    <div className="dlt-now" style={{ width: proMode ? `${d.now / max * 100}%` : '0' }}></div>
                                                </div>
                                                <div className="dlt-scale">
                                                    <span>antes {fmt(d.was, d.dec)}{d.unit}</span>
                                                    <span>agora {fmt(d.now, d.dec)}{d.unit}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="evo-panel">
                            <div className="eyebrow">Marcos conquistados</div>
                            {!marksData || !marksData.marks || marksData.marks.length === 0 || FORCE_EMPTY_STATE ? (
                                <div style={{ fontSize: '13.5px', color: 'var(--ink-muted)', marginTop: '24px', lineHeight: 1.6, textAlign: 'center' }}>
                                    Nenhum marco alcançado.<br />Falta pouco para o seu primeiro.
                                </div>
                            ) : (
                                <div className="evo-marks" id="evo-marks">
                                    {marksData.marks.map((m, i) => (
                                        <div className="mark" key={i}>
                                            <span className="ic">◆</span>
                                            <div><div className="t">{m.t}</div><div className="s">{m.s}</div></div>
                                            <span className="w">{m.w}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="evo-next" id="evo-next" dangerouslySetInnerHTML={{ __html: marksData?.next }}></div>
                        </div>
                    </div>

                </div>

                {!isProUser && (
                    <div className="evo-gate" id="evo-gate">
                        <div className="evo-gate-card">
                            <div className="eyebrow">GymGramps Pro</div>
                            <h3>A sua evolução guiada de perto.</h3>
                            <p>Índice GG semanal, curvas de carga e peso, marcos automáticos e leitura personalizada do seu ciclo — atualizados a cada treino registrado.</p>
                            <div className="evo-gate-actions">
                                <button className="btn btn-lime">Desbloquear por R$ 19,90/mês</button>
                                <button className="btn btn-ghost" onClick={() => togglePro(true)}>Ver uma amostra</button>
                            </div>
                            <div className="evo-gate-note">7 dias grátis · cancele quando quiser</div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
