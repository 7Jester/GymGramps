const fs = require('fs');

const text = fs.readFileSync('Treino.jsx', 'utf-8');

const splitIndex1 = text.indexOf('    return (');
const splitIndex2 = text.indexOf('function LogExercicioCard');

if (splitIndex1 > -1 && splitIndex2 > -1) {
    const beforePart = text.slice(0, splitIndex1);
    const afterPart = text.slice(splitIndex2);

    // add a brace to close the Treino function before LogExercicioCard
    const replacement = `    const swapBtnStyle = {
        display: "flex", alignItems: "center", gap: 6, border: "1px solid #DCD6C8",
        borderRadius: 999, background: "#FDFBF5", color: "#5A5D50", fontFamily: "'DM Sans', sans-serif",
        fontSize: 12.5, fontWeight: 600, padding: "8px 14px 8px 10px", cursor: "pointer", flexShrink: 0,
        transition: "border-color .15s, color .15s",
    };

    return (
        <>
            <Header />
            <main style={{ background: "#EFEBE1", fontFamily: "'DM Sans', sans-serif", color: "#16180F", padding: "48px 0 80px", minHeight: "100vh" }}>
                <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 28px" }}>
                    
                    {modo === 'view' ? (
                    <>
                    <div style={{ marginBottom: 26 }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8A8B7C", marginBottom: 12 }}>
                            {diaSelecionado && diaSelecionado.nome !== diaPadrao.nome ? 'Treino Selecionado' : 'Treino de Hoje'}
                        </div>
                        <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 40, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.04em" }}>{dia.nome}</h1>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", gap: 14, alignItems: "start" }}>
                        {/* LISTA DE EXERCÍCIOS */}
                        <div style={{ background: "#F7F4EC", border: "1px solid #DCD6C8", borderRadius: 22, overflow: "hidden" }}>
                            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E4DFD2", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#5A5D50", lineHeight: 1.5 }}>
                                    {dia.aquecimento || 'Exercícios'}
                                </div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8A8B7C", whiteSpace: "nowrap", paddingTop: 2 }}>Séries × Reps</div>
                            </div>

                            {dia.exercicios.map((ex, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: "1px solid #E4DFD2" }}>
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#B4B2A2", width: 20, flexShrink: 0 }}>
                                         {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>{ex.nomeExercicio}</div>
                                    </div>
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 600, color: "#22381F", background: "#E4DFD2", borderRadius: 8, padding: "6px 12px", whiteSpace: "nowrap", flexShrink: 0 }}>
                                        {ex.seriesAlvo}×{ex.repsAlvo}
                                    </div>
                                    <button
                                        onClick={() => openTrocaModal(i, ex)}
                                        style={swapBtnStyle}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#22381F"; e.currentTarget.style.color = "#22381F"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#DCD6C8"; e.currentTarget.style.color = "#5A5D50"; }}
                                    >
                                        <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true"><path d="M4 7h10.5M14.5 7L11.5 4M14.5 7L11.5 10M16 13H5.5M5.5 13L8.5 16M5.5 13L8.5 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        Trocar
                                    </button>
                                </div>
                            ))}

                            <div style={{ padding: "22px 24px" }}>
                                <button onClick={iniciarRegistro} style={{ width: "100%", border: 0, borderRadius: 999, background: "#22381F", color: "#EFEBE1", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, padding: 16, cursor: "pointer" }}>
                                    {jaFeito ? "Treino já registrado. Treinar de novo?" : "Começar a Registrar Cargas"}
                                </button>
                            </div>
                        </div>

                        {/* COLUNA LATERAL */}
                        <div style={{ display: "grid", gap: 14 }}>
                            <div style={{ background: "#F7F4EC", border: "1px solid #DCD6C8", borderRadius: 22, padding: "22px 24px" }}>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8A8B7C", marginBottom: 14 }}>Sua rotina completa</div>
                                <div style={{ display: "grid", gap: 8 }}>
                                    {plano.treinoDia.map((r, idx) => {
                                        const active = r.nome === dia.nome;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setDiaSelecionado(r)}
                                                style={{
                                                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left",
                                                    border: \`1px solid \${active ? "#22381F" : "#DCD6C8"}\`, borderRadius: 14,
                                                    background: active ? "#22381F" : "#FDFBF5", padding: "13px 16px", cursor: "pointer",
                                                }}
                                            >
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? "#EFEBE1" : "#16180F", lineHeight: 1.35 }}>{r.nome}</div>
                                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: active ? "rgba(239,235,225,0.62)" : "#8A8B7C", marginTop: 3, lineHeight: 1.4 }}>{r.musculosAlvo || 'Treino do plano'}</div>
                                                </div>
                                                <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" style={{ flexShrink: 0, color: active ? "#C9E86B" : "#B4B2A2" }}><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ background: "#F7F4EC", border: "1px solid #DCD6C8", borderRadius: 22, padding: "22px 24px" }}>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8A8B7C", marginBottom: 10 }}>Histórico deste treino</div>
                                {sessoes.filter(s => s.nomeDia === dia.nome).length === 0 ? (
                                    <div style={{ fontSize: 13.5, color: "#5A5D50", lineHeight: 1.55 }}>Nenhum registro para este treino ainda. Seu primeiro registro aparece aqui depois que você fechar a série de hoje.</div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '14px' }}>
                                        {sessoes.filter(s => s.nomeDia === dia.nome).slice(0, 3).map((s, i) => {
                                            const totalSeries = s.exercicios.reduce((acc, ex) => acc + ex.series.length, 0);
                                            return (
                                                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: "#22381F" }}>{formatarData(s.data)}</span>
                                                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#5A5D50' }}>{totalSeries} séries com cargas</span>
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
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8A8B7C", marginBottom: 12 }}>
                                        Registrando
                                    </div>
                                    <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 40, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.04em" }}>{dia.nome}</h1>
                                </div>
                                <button type="button" onClick={cancelarRegistro} style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#8A8B7C', fontSize: '14px' }}>Cancelar</button>
                            </div>

                            <div style={{ background: "#F7F4EC", border: "1px solid #DCD6C8", borderRadius: 22, overflow: "hidden", padding: "0" }}>
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
                                <div style={{ padding: '22px 26px', borderTop: '1px solid #DCD6C8' }}>
                                    <button type="button" onClick={concluirRegistro} style={{ width: "100%", border: 0, borderRadius: 999, background: "#22381F", color: "#EFEBE1", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, padding: 16, cursor: "pointer" }}>
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
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#FDFBF5", border: "1px solid #DCD6C8", borderRadius: 22, padding: 30, width: "100%", maxWidth: 460 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                        <div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8A8B7C", marginBottom: 10 }}>Redefinir exercício</div>
                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Substituir "{dia.exercicios[trocandoExIdx].nomeExercicio}"</div>
                        </div>
                        <button onClick={closeTrocaModal} style={{ width: 34, height: 34, flexShrink: 0, border: "1px solid #DCD6C8", borderRadius: "50%", background: "#FDFBF5", color: "#5A5D50", display: "grid", placeItems: "center", cursor: "pointer" }}>
                        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                        </button>
                    </div>

                    <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6 }}>
                        <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" style={{ color: "#6E8B2E" }}><path d="M10 2l1.6 4.6L16 8l-4.4 1.4L10 14l-1.6-4.6L4 8l4.4-1.4L10 2z" fill="currentColor" /></svg>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6E8B2E" }}>Opções inteligentes (IA)</span>
                    </div>

                    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                        {isFetchingSugestoes ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#6E8B2E', fontSize: 13.5 }}>Analisando biomecânica via IA...</div>
                        ) : (
                            <>
                            {sugestoes.map((sug, i) => {
                            const picked = novoNomeEx === sug && !isCustomEx;
                            return (
                                <button
                                key={i}
                                onClick={() => { setNovoNomeEx(sug); setIsCustomEx(false); }}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left", border: \`1px solid \${picked ? "#22381F" : "#DCD6C8"}\`, borderRadius: 14, background: picked ? "#EFEBE1" : "#FDFBF5", padding: "12px 14px", cursor: "pointer" }}
                                >
                                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                    <span style={{ width: 18, height: 18, borderRadius: "50%", border: \`1.5px solid \${picked ? "#22381F" : "#DCD6C8"}\`, background: picked ? "#22381F" : "none", display: "grid", placeItems: "center", flexShrink: 0 }}>
                                    {picked && <svg viewBox="0 0 10 10" width="7" height="7" aria-hidden="true"><path d="M1.8 5.2l2.1 2L8.2 2.8" fill="none" stroke="#EFEBE1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                    </span>
                                    <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{sug}</span>
                                </div>
                                </button>
                            );
                            })}
                            {sugestoes.length === 0 && <div style={{ fontSize: 13, color: "#8A8B7C", padding: "8px 0" }}>A IA encontrou dificuldades em isolar este exercício neste momento.</div>}
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => { setIsCustomEx(true); setNovoNomeEx(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 8, border: "1px dashed #DCD6C8", borderRadius: 14, background: "none", color: isCustomEx ? "#22381F" : "#5A5D50", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, padding: "12px 14px", cursor: "pointer", width: "100%", marginTop: 14 }}
                    >
                        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                        Inserir exercício manualmente
                    </button>

                    {isCustomEx && (
                        <input
                        value={novoNomeEx}
                        onChange={(e) => setNovoNomeEx(e.target.value)}
                        placeholder="Nome do exercício"
                        style={{ width: "100%", marginTop: 10, border: "1px solid #DCD6C8", borderRadius: 12, background: "#FFFDF8", padding: "12px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: "#16180F", outline: "none" }}
                        />
                    )}

                    <button
                        onClick={confirmarTrocaExercicio}
                        disabled={!novoNomeEx.trim() || isFetchingSugestoes}
                        style={{ width: "100%", marginTop: 18, border: 0, borderRadius: 999, background: (novoNomeEx.trim() && !isFetchingSugestoes) ? "#22381F" : "#E4DFD2", color: (novoNomeEx.trim() && !isFetchingSugestoes) ? "#EFEBE1" : "#B4B2A2", fontFamily: "'DM Sans', sans-serif", fontSize: 14.5, fontWeight: 700, padding: 14, cursor: (novoNomeEx.trim() && !isFetchingSugestoes) ? "pointer" : "not-allowed" }}
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

`;
    const newText = beforePart + replacement + afterPart;
    fs.writeFileSync('Treino.jsx', newText, 'utf-8');
    console.log('patched successfully using string split');
} else {
    console.log('could not find split markers:', splitIndex1, splitIndex2);
}
