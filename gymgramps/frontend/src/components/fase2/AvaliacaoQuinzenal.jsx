import { useState } from "react";
import { C, F, eyebrow, GGStyles } from "./gg";

const QUESTIONS = [
  { tag: "Recuperação", q: "Como foi sua recuperação muscular entre os treinos?", opts: [
    ["Recuperado", "Chego inteiro no treino seguinte"], ["Um pouco dolorido", "Dor leve, não atrapalha"], ["Muito dolorido", "Ainda sinto no treino seguinte"]] },
  { tag: "Fome", q: "Tem sentido fome fora de hora?", opts: [
    ["Nunca", "Refeições seguram bem"], ["Às vezes", "Principalmente à tarde ou à noite"], ["Quase sempre", "Belisco com frequência"]] },
  { tag: "Sono", q: "Como você tem dormido?", opts: [
    ["Bem", "7 h ou mais, acordo descansado"], ["Regular", "6–7 h, às vezes interrompido"], ["Mal", "Menos de 6 h ou acordo cansado"]] },
  { tag: "Energia", q: "Como está sua energia durante o treino?", opts: [
    ["Alta", "Termino com gás sobrando"], ["Normal", "Cansado no fim, como esperado"], ["Baixa", "Fico sem força no meio"]] },
  { tag: "Intensidade", q: "Como está a intensidade do treino?", opts: [
    ["Fácil demais", "Completo todas as reps com folga"], ["Na medida", "As últimas reps são difíceis"], ["Pesado demais", "Não completo as reps alvo"]] },
];

// RULES[pergunta][resposta] -> ajuste (ou null). Troque pela lógica do seu backend.
const RULES = [
  [{ area: "Treino A · Push", what: "Carga no supino", from: "80 kg", to: "82,5 kg", why: "Você está se recuperando bem — hora de progredir." },
   { area: "Recuperação", what: "Descanso entre séries", from: "90 s", to: "120 s", why: "Dor leve pede um pouco mais de pausa, sem tirar carga." },
   { area: "Treino A · Push", what: "Carga do treino", from: "100%", to: "90%", why: "Recuperação lenta: reduzimos 10% por uma semana." }],
  [null,
   { area: "Dieta", what: "Proteína diária", from: "150 g", to: "165 g", why: "Mais proteína ajuda a segurar a fome entre refeições." },
   { area: "Dieta", what: "Calorias diárias", from: "2.400 kcal", to: "2.550 kcal", why: "Fome frequente indica déficit agressivo demais." }],
  [null, null, { area: "Recuperação", what: "Séries por exercício", from: "4", to: "3", why: "Com sono ruim, menos volume rende mais." }],
  [null, null, { area: "Dieta · Pré-treino", what: "Carboidrato antes do treino", from: "30 g", to: "60 g", why: "Mais combustível para chegar ao fim do treino." }],
  [{ area: "Progressão", what: "Aumento semanal de carga", from: "+2,5%", to: "+5%", why: "Treino fácil demais: aceleramos a progressão." },
   null,
   { area: "Treino", what: "Repetições alvo", from: "8–10", to: "6–8", why: "Ajustamos para você completar todas as séries." }],
];

export default function AvaliacaoQuinzenal({ onApply }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);
  const [applied, setApplied] = useState(false);

  const q = QUESTIONS[step];
  const adjustments = answers.map((a, i) => RULES[i]?.[a]).filter(Boolean);

  function pick(i) {
    const next = [...answers.slice(0, step), i];
    setAnswers(next);
    if (step >= QUESTIONS.length - 1) setDone(true);
    else setTimeout(() => setStep((s) => s + 1), 180);
  }
  function restart() { setStep(0); setAnswers([]); setDone(false); setApplied(false); }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", fontFamily: F.body, color: C.ink }}>
      <GGStyles />
      {!done ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 600, color: C.moss }}>
              {String(step + 1).padStart(2, "0")} / 0{QUESTIONS.length}
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${QUESTIONS.length}, 1fr)`, gap: 4 }}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{ height: 4, borderRadius: 2, background: i <= step ? C.moss : C.line, transition: "background .2s" }} />
              ))}
            </div>
            <button onClick={() => step > 0 && setStep(step - 1)}
              style={{ border: 0, background: "none", color: step > 0 ? C.ink2 : "transparent", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 4 }}>Voltar</button>
          </div>

          <div key={step} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 24, padding: "clamp(22px,5vw,36px)", animation: "ggRise .25s ease both" }}>
            <div style={{ ...eyebrow(C.leaf), marginBottom: 14 }}>{q.tag}</div>
            <div style={{ fontFamily: F.display, fontSize: "clamp(24px,4.2vw,32px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, textWrap: "pretty" }}>{q.q}</div>
            <div style={{ display: "grid", gap: 10, marginTop: 26 }}>
              {q.opts.map(([label, hint], i) => {
                const on = answers[step] === i;
                return (
                  <button key={label} onClick={() => pick(i)}
                    style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 64, textAlign: "left", border: `1.5px solid ${on ? C.moss : C.line}`, background: on ? C.paper : C.field, borderRadius: 16, padding: "14px 18px", cursor: "pointer" }}>
                    <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 9, background: on ? C.moss : C.line2, color: on ? C.lime : C.moss, display: "grid", placeItems: "center", fontFamily: F.mono, fontSize: 12, fontWeight: 600 }}>{"ABC"[i]}</span>
                    <span>
                      <span style={{ display: "block", fontSize: 16, fontWeight: 700 }}>{label}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: C.mute, marginTop: 2 }}>{hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.mute, textAlign: "center", marginTop: 14 }}>Leva 1 minuto. Suas respostas ajustam treino e dieta das próximas 2 semanas.</div>
        </>
      ) : (
        <div style={{ background: C.moss, color: C.paper, borderRadius: 24, padding: "clamp(22px,5vw,34px)", animation: "ggRise .3s ease both" }}>
          <div style={{ ...eyebrow(C.lime), marginBottom: 12 }}>Ajuste de rota · próximas 2 semanas</div>
          <div style={{ fontFamily: F.display, fontSize: "clamp(26px,4.5vw,34px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {adjustments.length ? `Mudamos ${adjustments.length} ${adjustments.length === 1 ? "coisa" : "coisas"} no seu plano.` : "Nenhuma mudança necessária."}
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 24 }}>
            {(adjustments.length ? adjustments : [{ area: "Plano", what: "Treino e dieta", from: "atual", to: "mantido", why: "Tudo em ordem — siga o plano como está." }]).map((a, i) => (
              <div key={i} style={{ background: "rgba(239,235,225,.06)", border: "1px solid rgba(239,235,225,.14)", borderRadius: 16, padding: "16px 18px", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "6px 16px", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: F.mono, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(239,235,225,.55)" }}>{a.area}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{a.what}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: F.mono, fontSize: 13, whiteSpace: "nowrap" }}>
                  <span style={{ color: "rgba(239,235,225,.5)", textDecoration: "line-through" }}>{a.from}</span>
                  <svg viewBox="0 0 16 16" width="12" height="12"><path d="M3 8h9M9 4.5L12.5 8 9 11.5" fill="none" stroke={C.lime} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span style={{ color: C.lime, fontWeight: 600 }}>{a.to}</span>
                </div>
                <div style={{ gridColumn: "1 / -1", fontSize: 12.5, color: "rgba(239,235,225,.62)", lineHeight: 1.45 }}>{a.why}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
            <button onClick={() => { setApplied(true); onApply?.(adjustments); }}
              style={{ border: 0, borderRadius: 999, background: C.lime, color: C.ink, fontSize: 14.5, fontWeight: 700, padding: "14px 22px", cursor: "pointer" }}>
              {applied ? "Aplicado ✓" : "Aplicar ao meu plano"}
            </button>
            <button onClick={restart}
              style={{ border: "1px solid rgba(239,235,225,.25)", borderRadius: 999, background: "none", color: C.paper, fontSize: 14, fontWeight: 600, padding: "13px 20px", cursor: "pointer" }}>Refazer avaliação</button>
          </div>
        </div>
      )}
    </div>
  );
}
