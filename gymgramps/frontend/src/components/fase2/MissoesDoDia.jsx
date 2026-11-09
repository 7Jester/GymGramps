import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, F, eyebrow, GGStyles } from "./gg";

// Troque por missões vindas da API (com `done` persistido no backend).
const MISSIONS = [
  { id: "m1", title: "Bater a proteína do dia", sub: "0 / 150 g", xp: 30, route: "/alimentacao" },
  { id: "m2", title: "Registrar o treino de hoje", sub: "Treino D · Pendente", xp: 40, route: "/treino" },
  { id: "m3", title: "Beber 2,5 L de água", sub: "0 / 2,5 L", xp: 20, route: "/alimentacao" },
];

export default function MissoesDoDia({ onComplete }) {
  const navigate = useNavigate();
  // Estado será inicializado pela API real futuramente. No empty state, nada está feito.
  const [done] = useState({});
  const total = MISSIONS.reduce((a, m) => a + (done[m.id] ? m.xp : 0), 0);
  const max = MISSIONS.reduce((a, m) => a + m.xp, 0);

  function handleClick(m) {
    if (m.route) navigate(m.route);
  }

  return (
    <div style={{ width: '100%', display: "grid", gap: 14, fontFamily: F.body, color: C.ink }}>
      <GGStyles />
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 22, overflow: "hidden" }}>
        <div style={{ padding: "20px 22px", borderBottom: `1px solid ${C.line2}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <div style={eyebrow()}>Missões do dia</div>
            <div style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 600, color: C.moss }}>{total} / {max} GG Points</div>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: C.line2, marginTop: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(total / max) * 100}%`, background: C.moss, borderRadius: 4, transition: "width .4s ease" }} />
          </div>
        </div>

        {MISSIONS.map((m) => {
          const on = !!done[m.id];
          return (
            <button key={m.id} onClick={() => handleClick(m)}
              style={{ width: "100%", minHeight: 72, display: "flex", alignItems: "center", gap: 14, textAlign: "left", border: 0, borderBottom: `1px solid ${C.line2}`, background: on ? C.limeSoft : "transparent", padding: "18px 22px", cursor: "pointer", transition: "background .2s" }}>
              <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 9, border: `2px solid ${on ? C.moss : C.faint}`, background: on ? C.moss : C.field, display: "grid", placeItems: "center" }}>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: on ? C.ink2 : C.ink, textDecoration: on ? "line-through" : "none" }}>{m.title}</span>
                <span style={{ display: "block", fontFamily: F.mono, fontSize: 11.5, color: C.mute, marginTop: 3 }}>{m.sub}</span>
              </span>
              <span style={{ position: "relative", flexShrink: 0 }}>
                <span style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 600, color: on ? C.ink : C.ink2, background: on ? C.lime : C.line2, borderRadius: 999, padding: "5px 10px" }}>+{m.xp} GG Points</span>
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ background: C.moss, color: C.paper, borderRadius: 22, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ ...eyebrow("rgba(239,235,225,.6)"), fontSize: 10.5, letterSpacing: ".14em" }}>Missão da semana · +120 GG Points</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>Treinar 4 vezes até domingo</div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[1, 1, 1, 0].map((f, i) => (
            <span key={i} style={{ width: 26, height: 26, borderRadius: 7, background: f ? C.lime : "transparent", border: f ? 0 : "1.5px dashed rgba(239,235,225,.35)" }} />
          ))}
        </div>
      </div>

      {total === max && (
        <div style={{ fontSize: 13.5, color: C.moss, fontWeight: 600, textAlign: "center", animation: "ggRise .3s ease both" }}>Dia fechado. +{total} GG Points somados ao seu Índice GG.</div>
      )}
    </div>
  );
}
