import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { getSession, signOut, deleteAccount } from '../js/api/authApi.js';
import { saveUserData } from '../js/api/dbApi.js';
import DispositivosSaude from '../components/fase2/DispositivosSaude.jsx';

function Campo({ label, valor, editMode = false, name, onChange, type = "text", options, span2 = false }) {
    return (
        <div className={span2 ? "span2" : ""}>
            <div className="k">{label}</div>
            {editMode ? (
                options ? (
                    <select name={name} value={valor} onChange={onChange} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface)', padding: '6px 10px', color: 'var(--ink)', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '8px' }}>
                        {options.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                    </select>
                ) : (
                    <input type={type} name={name} value={valor} onChange={onChange} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface)', padding: '6px 10px', color: 'var(--ink)', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '8px' }} />
                )
            ) : (
                <div className="v">{valor}</div>
            )}
        </div>
    );
}

export default function Perfil() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        getSession().then(setSession).catch(console.error);

        try {
            const savedPerfil = JSON.parse(localStorage.getItem('gymgramps_perfil'));
            if (savedPerfil) setPerfil(savedPerfil);
        } catch (e) { }
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Você tem certeza que deseja excluir sua conta? Todos os seus dados serão apagados permanentemente.")) {
            await deleteAccount();
            navigate('/login');
        }
    };

    const handleSavePerfil = async () => {
        if (perfil) {
            localStorage.setItem('gymgramps_perfil', JSON.stringify(perfil));
            if (session?.user) {
                try {
                    await saveUserData(session.user.id, { perfil });
                } catch (e) {
                    console.error("Falha ao salvar no cloud:", e);
                }
            }
        }
        setIsEditing(false);
    };

    const handlePerfilChange = (e) => {
        const { name, value } = e.target;
        setPerfil(prev => ({ ...prev, [name]: value }));
    };

    const nome = session?.user?.user_metadata?.apelido || "Atleta";
    const email = session?.user?.email || "—";
    const initial = nome.charAt(0).toUpperCase();

    return (
        <>
            <Header />
            <main className="wrap">
                <section className="screen" id="perfil">
                    <div className="page-head">
                        <div className="eyebrow">Perfil</div>
                        <h1>Seu perfil</h1>
                    </div>

                    <div className="split">
                        <div className="stack">
                            <div className="card profile">
                                <div className="big">{initial}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', letterSpacing: '-.02em' }}>{nome}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '2px' }}>{email}</div>
                                </div>
                                <span className="tag">FREE</span>
                            </div>

                            <div className="card card-flush">
                                <div className="list-head">
                                    <span className="eyebrow">Dados corporais</span>
                                    {isEditing ? (
                                        <button onClick={handleSavePerfil} type="button" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer' }}>Salvar</button>
                                    ) : (
                                        <button onClick={() => setIsEditing(true)} type="button" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Editar</button>
                                    )}
                                </div>
                                <div className="data-grid">
                                    <Campo label="Idade" valor={perfil ? `${perfil.idade} anos` : ""} name="idade" type="number" editMode={isEditing} onChange={handlePerfilChange} />
                                    <Campo label="Sexo" valor={perfil ? perfil.sexo : ""} name="sexo" options={["Masculino", "Feminino", "Outro"]} editMode={isEditing} onChange={handlePerfilChange} />
                                    <Campo label="Peso atual" valor={perfil ? `${perfil.peso} kg` : ""} name="peso" type="number" editMode={isEditing} onChange={handlePerfilChange} />
                                    <Campo label="Altura" valor={perfil ? `${perfil.altura} cm` : ""} name="altura" type="number" editMode={isEditing} onChange={handlePerfilChange} />
                                    <Campo label="Objetivo" valor={perfil ? (perfil.objetivo === "ganho_massa" ? "Ganho de massa" : perfil.objetivo === "perda_gordura" ? "Perda de gordura" : "Manutenção") : ""} name="objetivo" options={["ganho_massa", "perda_gordura", "manutencao"]} editMode={isEditing} onChange={handlePerfilChange} span2={true} />
                                </div>
                            </div>
                        </div>

                        <div className="stack">
                            <DispositivosSaude />
                            <div className="card" style={{ padding: '24px' }}>
                                <div className="eyebrow" style={{ marginBottom: '6px' }}>Preferências</div>
                                <div className="pref">
                                    <span style={{ fontSize: '15px' }}>Tema (Alterne)</span>
                                    <ThemeToggle />
                                </div>
                            </div>

                            <button type="button" onClick={handleSignOut} className="btn-outline">
                                Sair da conta
                            </button>
                            <button type="button" onClick={handleDeleteAccount} className="btn-danger">
                                Excluir conta
                            </button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
