import { useState } from "react";
import { C, F, eyebrow, GGStyles } from "./gg";

const READS = [
  ["Passos e distância", "Para estimar o gasto fora do treino"],
  ["Calorias ativas", "Ajusta a meta diária de calorias"],
  ["Sono", "Entra na avaliação quinzenal de recuperação"],
  ["Frequência cardíaca", "Refina o gasto calórico dos treinos"],
];
const DATA = [["Passos hoje", "8.412"], ["Kcal ativas", "420"], ["Sono", "7h 10"], ["FC repouso", "58 bpm"]];

// onConnect deve iniciar o fluxo OAuth / Health Connect e resolver quando concluir.
export default function DispositivosSaude({ onConnect = () => new Promise((r) => setTimeout(r, 1200)), onDisconnect }) {
  const [connected, setConnected] = useState(false);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);

  async function connect() {
    setBusy(true);
    try { await onConnect(); setConnected(true); setModal(false); } finally { setBusy(false); }
  }

  const Row = ({ mono, name, status, dot, iconBg, iconInk, btn, primary, disabled, onClick }) => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, padding: "18px 24px", borderBottom: `1px solid ${C.line2}` }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, color: iconInk, display: "grid", placeItems: "center", fontFamily: F.display, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{mono}</div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot }} />
          <span style={{ fontFamily: F.mono, fontSize: 11.5, color: C.mute }}>{status}</span>
        </div>
      </div>
      <button onClick={onClick} disabled={disabled}
        style={{ minHeight: 44, border: `1px solid ${primary ? C.moss : disabled ? C.line2 : C.line}`, borderRadius: 999, background: primary ? C.moss : "transparent", color: primary ? C.paper : disabled ? C.faint : C.ink2, fontSize: 13, fontWeight: 700, padding: "10px 18px", cursor: disabled ? "default" : "pointer" }}>{btn}</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, display: "grid", gap: 14, fontFamily: F.body, color: C.ink }}>
      <GGStyles />
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 22, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.line2}` }}>
          <div style={eyebrow()}>Perfil · Dispositivos &amp; Saúde</div>
          <div style={{ fontSize: 14, color: C.ink2, marginTop: 8, lineHeight: 1.5 }}>Conecte seu celular ou relógio para que passos, sono e calorias gastas entrem no cálculo da sua meta diária.</div>
        </div>
        {connected ? (
          <Row mono="G" name="Google Fit · Health Connect" status="Conectado · sincronizado há 2 min" dot={C.leaf} iconBg={C.moss} iconInk={C.lime} btn="Desconectar"
            onClick={() => { setConnected(false); onDisconnect?.(); }} />
        ) : (
          <Row mono="G" name="Google Fit · Health Connect" status="Não conectado" dot={C.faint} iconBg={C.line2} iconInk={C.moss} btn="Conectar ao Google Fit" primary onClick={() => setModal(true)} />
        )}
        <Row mono="A" name="Apple Saúde" status="Em breve" dot={C.line} iconBg={C.line2} iconInk={C.mute} btn="Em breve" disabled />
        {connected && (
          <div style={{ padding: "18px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
            {DATA.map(([l, v]) => (
              <div key={l} style={{ background: C.field, border: `1px solid ${C.line2}`, borderRadius: 14, padding: 14 }}>
                <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: C.mute }}>{l}</div>
                <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 6 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {connected && (
        <div style={{ background: C.moss, color: C.paper, borderRadius: 22, padding: "20px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ ...eyebrow("rgba(239,235,225,.6)"), fontSize: 10.5 }}>Meta de hoje, com atividade</div>
            <div style={{ fontFamily: F.display, fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 6 }}>2.570 kcal</div>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 12.5, color: "rgba(239,235,225,.75)" }}>2.150 base <span style={{ color: C.lime }}>+ 420 atividade</span></div>
        </div>
      )}

      {modal && (
        <div onClick={() => setModal(false)} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(22,24,15,.55)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 16, animation: "ggFade .15s ease both" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, maxHeight: "calc(100vh - 32px)", overflowY: "auto", background: C.field, border: `1px solid ${C.line}`, borderRadius: 24, padding: "clamp(22px,5vw,30px)", animation: "ggRise .2s ease both" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ ...eyebrow(C.leaf), marginBottom: 10 }}>Google Fit · Health Connect</div>
                <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Sua meta passa a acompanhar o seu dia real</div>
              </div>
              <button onClick={() => setModal(false)} aria-label="Fechar" style={{ width: 36, height: 36, flexShrink: 0, border: `1px solid ${C.line}`, borderRadius: "50%", background: C.field, color: C.ink2, display: "grid", placeItems: "center", cursor: "pointer" }}>
                <svg viewBox="0 0 16 16" width="13" height="13"><path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            </div>

            <div style={{ marginTop: 22, background: C.card, border: `1px solid ${C.line2}`, borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ ...eyebrow(), fontSize: 10.5, letterSpacing: ".12em", marginBottom: 12 }}>Como a meta é calculada</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: 8, textAlign: "center" }}>
                {[["2.150", "Base", C.ink], ["+"], ["420", "Atividade", C.leaf], ["="], ["2.570", "Meta kcal", C.moss]].map((x, i) =>
                  x.length === 1 ? <div key={i} style={{ fontFamily: F.mono, color: C.mute }}>{x[0]}</div> : (
                    <div key={i}><div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 800, color: x[2] }}>{x[0]}</div><div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>{x[1]}</div></div>
                  ))}
              </div>
              <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 12, lineHeight: 1.5 }}>Sem conexão, usamos uma estimativa fixa de atividade. Conectado, a parte "Atividade" muda todo dia conforme o que você realmente gastou.</div>
            </div>

            <div style={{ ...eyebrow(), fontSize: 10.5, letterSpacing: ".12em", margin: "20px 0 10px" }}>O que vamos ler</div>
            <div style={{ display: "grid", gap: 8 }}>
              {READS.map(([t, s]) => (
                <div key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: C.line2, color: C.moss, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg viewBox="0 0 10 10" width="9" height="9"><path d="M1.8 5.2l2.1 2L8.2 2.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <div><div style={{ fontSize: 14, fontWeight: 700 }}>{t}</div><div style={{ fontSize: 12.5, color: C.mute, marginTop: 2 }}>{s}</div></div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.mute, marginTop: 16, lineHeight: 1.5 }}>Só leitura. Nada é publicado e você pode desconectar quando quiser.</div>
            <button onClick={connect} disabled={busy} style={{ width: "100%", minHeight: 50, marginTop: 18, border: 0, borderRadius: 999, background: C.moss, color: C.paper, fontSize: 15, fontWeight: 700, padding: 15, cursor: "pointer" }}>{busy ? "Conectando…" : "Conectar ao Google Fit"}</button>
            <button onClick={() => setModal(false)} style={{ width: "100%", marginTop: 8, border: 0, background: "none", color: C.ink2, fontSize: 13.5, fontWeight: 600, padding: 10, cursor: "pointer" }}>Agora não</button>
          </div>
        </div>
      )}
    </div>
  );
}
