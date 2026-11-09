# GymGramps · Fase 2 — componentes React

Copie a pasta `fase2/` para `src/components/` (ou similar). Só depende de `react`. Estilos inline, sem CSS extra.

| Arquivo | Feature | Ganchos p/ backend |
|---|---|---|
| `gg.jsx` | tokens (cores/fontes) + keyframes (`<GGStyles/>`) | — |
| `AvaliacaoQuinzenal.jsx` | Quiz + "Ajuste de rota" | `onApply(ajustes)`; troque `RULES` pela lógica do servidor |
| `DashboardProgresso.jsx` | Gráfico de volume + stats | troque `VOLUME` e `STATS` pela API |
| `DispositivosSaude.jsx` | Perfil › Dispositivos + modal | `onConnect()` (OAuth/Health Connect), `onDisconnect()` |
| `VozTreino.jsx` | FAB de microfone + overlay | usa Web Speech API (pt-BR); sem suporte, roda demo |
| `LigaAmigos.jsx` | Aba Amigos / Global | `onInvite()`; troque `BOARD` pela API |
| `MissoesDoDia.jsx` | Checklist + XP | `onComplete(missão)`; persista `done` no backend |

Fontes (no `<head>`):
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
```

Uso:
```jsx
import MissoesDoDia from "./fase2/MissoesDoDia";
<MissoesDoDia onComplete={(m) => api.post("/missoes/concluir", { id: m.id })} />
```
Obs.: `VozTreino` precisa de HTTPS e permissão de microfone. Web Speech funciona em Chrome/Edge/Android.
