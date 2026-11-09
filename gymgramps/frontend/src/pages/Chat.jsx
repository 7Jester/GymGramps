import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons.jsx';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';

const BOAS_VINDAS = {
    papel: "assistant",
    conteudo: "Oi! Sou o assistente do seu plano. Pode perguntar sobre seu treino, sua dieta ou seu cronograma de hoje."
};

const gerarRespostaSimulada = (pergunta) => {
    const texto = pergunta.toLowerCase();
    if (texto.includes("treino")) return `Seu plano está ativo e mapeado para seus dias. Olhe a tela de Treino!`;
    if (texto.includes("caloria") || texto.includes("dieta") || texto.includes("comer") || texto.includes("comida")) return `Você está dentro da dieta, priorize as proteínas.`;
    if (texto.includes("horário") || texto.includes("rotina") || texto.includes("cronograma")) return "Seu cronograma cruza treino e dieta com os horários fixos que você cadastrou no onboarding.";
    return "Ainda estou sendo treinado com o Gemini pra responder isso com mais profundidade — em breve utilizaremos o contexto real no backend.";
};

export default function Chat() {
    const STORAGE_KEY = "gymgramps-chat-mensagens";
    const [mensagens, setMensagens] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [BOAS_VINDAS];
        } catch { return [BOAS_VINDAS]; }
    });

    const [inputText, setInputText] = useState("");
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensagens]);

    const addMensagemLocal = (mensagem) => {
        setMensagens(prev => {
            const nv = [...prev, mensagem];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nv));
            return nv;
        });
    };

    const handleSend = (text) => {
        if (!text.trim()) return;

        addMensagemLocal({ papel: "user", conteudo: text.trim() });
        setInputText("");

        setTimeout(() => {
            addMensagemLocal({ papel: "assistant", conteudo: gerarRespostaSimulada(text.trim()) });
        }, 500);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSend(inputText);
    };

    return (
        <>
            <Header />
            <main className="wrap">
                <section className="screen chat" id="chat">
                    <div className="page-head">
                        <div className="eyebrow">Assistente</div>
                        <h1>Pergunte o que quiser</h1>
                        <p style={{ margin: '12px 0 0', fontSize: '15px', color: 'var(--ink-soft)', maxWidth: '62ch', lineHeight: '1.55', textWrap: 'pretty' }}>
                            Sugestões educativas com base no seu plano — não substitui orientação de nutricionista (CFN) ou profissional de Educação Física (CREF).
                        </p>
                    </div>

                    <div className="msgs">
                        {mensagens.map((m, i) =>
                            m.papel === "user" ? (
                                <div key={i} className="msg-me">
                                    {m.conteudo}
                                </div>
                            ) : (
                                <div key={i} className="msg-bot">
                                    {m.conteudo}
                                </div>
                            )
                        )}
                        <div ref={endOfMessagesRef} />
                    </div>

                    <form className="composer" onSubmit={handleSubmit}>
                        <input
                            placeholder="Pergunte sobre seu treino, dieta ou rotina…"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                        />
                        <button type="submit" className="send">↑</button>
                    </form>

                    <div className="suggest">
                        <span onClick={() => handleSend("Como ajustar meu déficit?")}>Como ajustar meu déficit?</span>
                        <span onClick={() => handleSend("Substituir o arroz do almoço")}>Substituir o arroz do almoço</span>
                        <span onClick={() => handleSend("Treino de hoje mais curto")}>Treino de hoje mais curto</span>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
