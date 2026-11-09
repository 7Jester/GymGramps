const fs = require('fs');
let code = fs.readFileSync('src/pages/Alimentacao.jsx', 'utf8');

// 1. Restore the state elements needed.
code = code.replace(
    'const [tipoSelecionado, setTipoSelecionado] = useState(TIPOS_REFEICAO[0]);',
    'const [tipoSelecionado, setTipoSelecionado] = useState(TIPOS_REFEICAO[0]);\n    const [editandoSugestao, setEditandoSugestao] = useState(null);'
);

code = code.replace(
    'setMostrandoForm(false);\n        setMostrandoForm(false);\n        setMostrandoForm(false);\n        setItensRefeicao([]);',
    'setMostrandoForm(false);\n        setEditandoSugestao(null);\n        setItensRefeicao([]);'
);

code = code.replace(
    'setMostrandoForm(false);\r\n        setMostrandoForm(false);\r\n        setMostrandoForm(false);\r\n        setItensRefeicao([]);',
    'setMostrandoForm(false);\n        setEditandoSugestao(null);\n        setItensRefeicao([]);'
);

// 2. Restore the original `rm-cols` block in `mostrandoForm`
const newModalForm = `<div style={{ marginTop: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 8px' }}>
                                    <span className="eyebrow" style={{ color: 'var(--ink-muted)' }}>O QUE VOCÊ COMEU</span>
                                </div>`;

const originalModalBlock = `<div className="rm-cols">
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
                            </div>`;

const searchStr1 = code.indexOf(newModalForm);
const searchStrEnd = code.indexOf('<div className="card card-flush">', searchStr1);

if (searchStr1 > 0 && searchStrEnd > 0) {
    // Need to find the exact closing bracket of the modal form ')}'
    const blockToReplace = code.substring(searchStr1, searchStrEnd);
    // Find the last '</div>' in that block, which should be the end of rm-actions
    const lastDivIdx = blockToReplace.lastIndexOf('</div>');
    // And actually it should replace up to the end of the form block
    // We will just replace from `<div style={{ marginTop: '32px' }}>` up to BEFORE `)}`

    // Easier: let's replace by Regex or just exact substring matching since we know exactly where it is.
}

// Just copy the entire target block from previous step and overwrite it in code.
// Because the regex string boundary is prone to failure, let's write the chunk down here:
// (Wait, we can just grab my exact previous inserted text!)

const targetInlineCard = `                                    <div style={{
                                        flex: 1,
                                        background: 'var(--surface)',
                                        border: '1px solid var(--line)',
                                        borderRadius: '16px',
                                        padding: '20px 24px',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>{r.nome}</h4>`;

const replacedInlineCard = `                                    <div style={{ flex: 1 }}>
                                    {editandoSugestao === r.nome ? (
                                        <div className="card" style={{ padding: '0', borderRadius: '16px', border: '1px solid var(--line)', background: 'var(--surface)', overflow: 'hidden' }}>
                                            <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--line)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className="eyebrow" style={{ color: 'var(--ink-muted)' }}>O QUE VOCÊ COMEU</span>
                                                    {localStorage.getItem('gymgramps_is_pro') !== 'true' ? (
                                                        <button type="button" onClick={() => alert('Assine o plano PRO para desbloquear a IA!')} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> Escanear com IA
                                                        </button>
                                                    ) : (
                                                        <label style={{ cursor: 'pointer', color: 'var(--brand)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                                            {isAnalyzingPhoto ? 'Analisando...' : 'Escanear com IA'}
                                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isAnalyzingPhoto} style={{ display: 'none' }} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
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
                                                                    padding: '4px 8px', background: 'var(--bg)',
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
                                            
                                            <div style={{ padding: '0 20px', marginTop: '16px' }}>
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

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 20px 20px' }}>
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
                                            flex: 1,
                                            background: 'var(--surface)',
                                            border: '1px solid var(--line)',
                                            borderRadius: '16px',
                                            padding: '20px 24px',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>{r.nome}</h4>`;

const endOfReplacedCard = `                                                    <button type="button" onClick={() => { setTipoSelecionado(r.nome); setItensRefeicao([]); setPesquisa(''); setEditandoSugestao(r.nome); }} style={{
                                                        background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', padding: '12px 24px',
                                                        borderRadius: '24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                                                    }}>Ajustar</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}`;

// Update onClick in endOfReplacedCard for "Editar" as well:
const targetEndOfReplacedCard = `                                                    <button type="button" onClick={() => { setTipoSelecionado(r.nome); setMostrandoForm(true); }} style={{
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
                                                    <button type="button" onClick={() => { setTipoSelecionado(r.nome); setMostrandoForm(true); }} style={{
                                                        background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', padding: '12px 24px',
                                                        borderRadius: '24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                                                    }}>Ajustar</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }}`;

const replacedEndOfReplacedCard = `                                                    <button type="button" onClick={() => { setTipoSelecionado(r.nome); setItensRefeicao([]); setPesquisa(''); setEditandoSugestao(r.nome); }} style={{
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
                                                    <button type="button" onClick={() => { setTipoSelecionado(r.nome); setItensRefeicao([]); setPesquisa(''); setEditandoSugestao(r.nome); }} style={{
                                                        background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', padding: '12px 24px',
                                                        borderRadius: '24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                                                    }}>Ajustar</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    )}
                                </div>
                            )
                        }}`;

code = code.replace(targetInlineCard, replacedInlineCard);

code = code.replace(targetEndOfReplacedCard, replacedEndOfReplacedCard);



// Let's rely on string indexOf and slicing to guarantee we overwrite the main form block exactly.
let startIdx = code.indexOf('<div style={{ marginTop: \\'32px\\' }}>');
let endIdx = code.indexOf(')}', startIdx);
if (startIdx > -1 && endIdx > -1) {
    // Wait, the ')}' might be the one closing `mostrandoForm && (`
    // Let's just find `<div className="card card-flush">` after this form, which indicates the end.
    let formEndIndicator = code.indexOf('<div className="card card-flush">', startIdx);
    let closingTagsIdx = code.lastIndexOf('</div>', formEndIndicator);
    closingTagsIdx = code.lastIndexOf('</div>', closingTagsIdx - 1);
    closingTagsIdx = code.lastIndexOf('</div>', closingTagsIdx - 1);
    closingTagsIdx = code.lastIndexOf(')', formEndIndicator);

    // Simpler: Just extract from startIdx to `)}` that precedes `<div className="card card-flush">`
    const beforePart = code.substring(0, startIdx);
    const afterPart = code.substring(closingTagsIdx - 1);
    code = beforePart + originalModalBlock + '\\n' + ' '.repeat(28) + afterPart;
}

fs.writeFileSync('src/pages/Alimentacao.jsx', code);
