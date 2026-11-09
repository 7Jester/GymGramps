export function getPromptTreino(perfil, rotina, frequencia, local) {
  return `
Você é um treinador de alto rendimento (Mestre em Fisiologia do Exercício) focado em biomecânica esportiva e periodização.
Crie um plano de treino prático, detalhado e altamente embasado cientificamente baseado neste perfil:
Perfil: ${JSON.stringify(perfil)}
Rotina diária: ${JSON.stringify(rotina)}
Frequência de treino: ${frequencia} vezes por semana.
Local de Treinamento: ${local}

O treino deve ser EXTREMAMENTE COMPLETO e moldado 100% PARA O LOCAL INFORMADO ACIMA:
- Se for 'Em casa', monte rotinas de calistenia, isometria, uso sensidato do peso corporal sem máquinas.
- Se for 'Academia', aplique as melhores divisões aproveitando aparelhos, halteres livres e polias, fundamentado na biomecânica.
- Se for 'Parque/Crossfit', foque em treinos funcionais (calistenia outdoor, barras) ou WOD de peso livre.
- Defina a sistemática com jargão técnico (ex: Push/Pull/Legs, Upper/Lower, etc).
- Para as séries de trabalho, aplique diretrizes de tempo sob tensão e porcentagem de 1RM (% peso) se couber, além de especificar volume ideal para ${perfil.objetivo}.

**Retorne EXCLUSIVAMENTE um JSON com esta estrutura (sem markdown ou \`\`\`):**
{
  "divisao": "string (ex: ABC - Push/Pull/Legs)",
  "diasPorSemana": number,
  "treinoDia": [
    {
      "nome": "string (ex: Treino A - Push)",
      "aquecimento": "string (ex: 5 min esteira + rotação de manguito)",
      "exercicios": [
        {
          "nomeExercicio": "string",
          "seriesAlvo": number,
          "repsAlvo": "string (ex: 8-10)",
          "percentualPeso": "string (ex: 75% RM)",
          "observacao": "string"
        }
      ]
    }
  ]
}`;
}

export function getPromptDieta(perfil, rotina, treinoPlan, restricoes) {
  return `
Você é um nutricionista esportivo de alta performance.
Crie um plano alimentar com calorias e macros calculados para o seguinte perfil:
Perfil: ${JSON.stringify(perfil)}
Rotina: ${JSON.stringify(rotina)}
Treinos por semana: ${treinoPlan.diasPorSemana}
Restrições alimentares: ${restricoes || "Nenhuma"}

1. Calcule a TMB (Taxa Metabólica Basal) e o GET (Gasto Energético Total).
2. Ajuste as calorias para o objetivo do perfil (Déficit para perda de peso, Superávit para ganho de massa).
3. Distribua os macros (Proteínas, Carboidratos, Gorduras).
4. Crie refeições encaixando na rotina do usuário.

**Retorne EXCLUSIVAMENTE um JSON (sem markdown):**
{
  "metaCalorica": number,
  "macros": { "proteinaG": number, "carboG": number, "gorduraG": number },
  "refeicoes": [
    {
      "nome": "string (ex: Café da Manhã)",
      "horario": "string (ex: 08:00)",
      "itens": "string (ex: 3 ovos, 30g aveia)",
      "calorias": number
    }
  ]
}`;
}

export function getPromptCronograma(perfil, rotina, treinoPlan, dietaPlan) {
  return `
Você é um coach de produtividade.
O usuário finalizou o onboarding e precisamos entregar uma rotina diária detalhada ("Cronograma") encaixando tudo.
Baseando-se em:
Perfil: ${JSON.stringify(perfil)}
Rotina: ${JSON.stringify(rotina)}
Treino: ${JSON.stringify(treinoPlan)}
Dieta: ${JSON.stringify(dietaPlan)}

Distribua os treinos e a alimentação perfeitamente no dia do usuário.
Os tipos de atividade disponíveis são: "refeicao", "treino", "trabalho", "faculdade", "sono", "outro".

**Retorne EXCLUSIVAMENTE um JSON (sem markdown):**
{
  "cronograma": [
    {
      "horario": "string (ex: 07:00)",
      "titulo": "string",
      "descricao": "string",
      "tipo": "string"
    }
  ]
}`;
}

export function getPromptPlanoFinal(perfil, rotina, frequencia, local, restricoes, treinoEstatico) {
  return `
Você é uma equipe de IA avançada: um Nutricionista Esportivo e um Coach de Produtividade de alta performance.
Sua missão é criar o "Plano Diretor" (Dieta e Cronograma do dia) sincronizados em um único plano para este perfil, **respeitando o treino que já foi estruturado**.

DADOS DO USUÁRIO:
Perfil: ${JSON.stringify(perfil)}
Rotina (Disponibilidade): ${JSON.stringify(rotina)}
Frequência de Treino: ${frequencia} vezes/semana
Local do Treino: ${local}
Restrições Alimentares: ${restricoes || "Nenhuma"}
Treino Base Recomendado Pelo Sistema: ${JSON.stringify(treinoEstatico)}

REGRAS RÍGIDAS E PROTOCOLOS:
1. DIETA: Calcule TMB e GET exatos para ${perfil.objetivo}. Forneça a meta calórica diária, os macros (pro/carb/fat) em gramas, e defina refeições que CAIBAM nos horários livres da Rotina enviada e apoiem o Treino Base.
2. CRONOGRAMA: Monte a "agenda do dia ideal". Inclua TODAS as refeições criadas, os blocos de rotina/sono declarados pelo usuário e o momento do treino em um array cronológico impecável.

**Retorne EXCLUSIVAMENTE um único objeto JSON (raiz) com 2 chaves: "dieta" e "cronograma":**
{
  "dieta": {
    "metaCalorica": number,
    "macros": { "proteinaG": number, "carboG": number, "gorduraG": number },
    "refeicoes": [{ "nome": "string", "horario": "string", "itens": "string", "calorias": number }]
  },
  "cronograma": [
    { "horario": "string", "titulo": "string", "descricao": "string", "tipo": "sono|refeicao|treino|trabalho|outro" }
  ]
}`;
}
