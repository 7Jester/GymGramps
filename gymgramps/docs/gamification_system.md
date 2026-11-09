# Sistema de Gamificação GymGramps

## Visão Geral
O sistema de gamificação é dividido em duas grandes métricas independentes, mas complementares: **GG Points (Plataforma)** e **Score da Liga (Competição)**. 

Essa separação garante que a progressão pessoal (hábitos) seja contínua, enquanto a competição social seja restrita a ciclos curtos e intensos (semanais).

---

## 1. Energia Pessoal (GG Points)
Os **GG Points** são a sua moeda de consistência pessoal de longo prazo. Eles **nunca** zeram e refletem a sua disciplina global na plataforma.

### Como Funcionam:
- Computam todos os micro e macrohábitos saudáveis.
- Estão acoplados às Missões Diárias e Semanais.
- Desbloqueiam emblemas definitivos na sua trajetória (`EvoDashboard`).

### Critérios de Pontuação (Exemplos Práticos):
| Ação | GG Points (Energia) |
| :--- | :--- |
| **Bater a Proteína Diária** | +30 GG Points |
| **Registrar Treino Completo** | +40 GG Points |
| **Bater Meta de Água (2.5L)** | +20 GG Points |
| **Missão Semanal** (Ex: Treinar 4x) | +120 GG Points |
| **Check-in Nutricional com Foto IA** | +25 GG Points / refeição |

### Missões Dinâmicas:
As missões (renderizadas no `MissoesDoDia.jsx`) operam apenas com GG Points. Cumprir essas pequenas metas não necessariamente te faz subir na Liga, mas alavanca o seu `Índice GG` de consistência, utilizado na Evolução Pro.

---

## 2. Liga Competitiva (Score da Liga)
O **Score da Liga (Pts / GG Score)** é a métrica competitiva, rápida e focada em interação social e consistência no curto prazo.

### Características:
- **Zera toda madrugada de Domingo para Segunda-feira.**
- Serve **exclusivamente** para subir e descer divisões (Ouro, Prata, Bronze, Diamante).
- Engaja a comunidade através de atitudes rigorosas (falhar tira pontos) e duelos.

### Critérios de Pontuação (Competição Direta):
| Ação Social/Disciplina | Pontos da Liga (Score) | Regra |
| :--- | :--- | :--- |
| **Treino Executado no Plano** | +12 Pts | Máximo 1 por dia |
| **Dia 100% (Dieta e Treino Ok)** | +6 Pts | Bônus de sobreposição |
| **Sequência de Dias Mantida** | +4 Pts | Dia a dia (máximo 7 dias úteis) |
| **Vitória em Duelo X1** | +25 Pts | Adicionado ao final da semana |
| **Treino Planejado NÃO Registrado** | -8 Pts | Punição por furar compromisso |
| **Derrota em Duelo X1** | -25 Pts | Subtraído (pode negativar) |

### Dinâmica Única:
Os duelos influenciam *apenas* a Liga. Dois usuários apostam o rendimento da semana. Quem acumular mais pontuação bruta de treino na semana fatura o montante inteiro de Pontos.

---

## Glossário para Interfaces UI
Para evitar confusões visuais no aplicativo:
- Utilize a nomenclatura `[X] GG Points` estritamente nas barras amarelas/verdes de hábitos, missões, onboarding diário e aba de Evolução.
- Na aba Comunidade / Liga (Ranking), utilize `[X] Pts` (Score GG). 

> *Nota de UX: As tabelas e cálculos aqui são exemplos de base arquitetural definidos sem acoplar 1:1 o frontend das funções da Gamificação Social com o Log de Refeições Diário.*
