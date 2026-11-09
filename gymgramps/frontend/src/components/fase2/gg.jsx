// Tokens e keyframes compartilhados. Renderize <GGStyles /> uma vez no app.
export const C = {
  paper: "#EFEBE1", card: "#F7F4EC", field: "#FDFBF5", line: "#DCD6C8", line2: "#E4DFD2",
  ink: "#16180F", ink2: "#5A5D50", mute: "#8A8B7C", faint: "#B4B2A2",
  moss: "#22381F", leaf: "#6E8B2E", lime: "#C9E86B", limeSoft: "#EEF3DA",
};
export const F = {
  display: "'Bricolage Grotesque', sans-serif",
  body: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};
export const eyebrow = (color = C.mute) => ({
  fontFamily: F.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color,
});
export const fmt = (n) => n.toLocaleString("pt-BR");

export function GGStyles() {
  return (
    <style>{`
      @keyframes ggRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      @keyframes ggFade{from{opacity:0}to{opacity:1}}
      @keyframes ggWave{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
      @keyframes ggXp{0%{opacity:0;transform:translateY(6px)}20%{opacity:1;transform:none}80%{opacity:1;transform:translateY(-14px)}100%{opacity:0;transform:translateY(-22px)}}
      @keyframes ggPop{0%{transform:scale(.6)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
    `}</style>
  );
}
// Fontes (coloque no <head> se ainda não tiver):
// <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
