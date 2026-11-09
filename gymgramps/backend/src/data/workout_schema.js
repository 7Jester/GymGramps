/**
 * Definições de Schema para a IA montar treinos avançados.
 * A estrutura requerida segue os melhores princípios de hipertrofia:
 * - Aquecimento específico (Warm-up Sets)
 * - Work Sets (Séries de trabalho válidas até atingir RIR adequado)
 * - RIR (Reps In Reserve / Repetições na Reserva) - conceito moderno pra evitar fadiga central à toa
 * - Resto (Tempo de descanso entre as séries do exercício)
 */

const workoutOutputSchema = {
    "type": "object",
    "properties": {
        "treino_nome": {
            "type": "string",
            "description": "Nome da divisão (ex: Treino A - Peito, Ombro e Tríceps)"
        },
        "objetivo_metabolico": {
            "type": "string",
            "description": "Ex: Hipertrofia Tensional, Resistência, Força Pura, etc."
        },
        "exercicios": {
            "type": "array",
            "description": "Lista com a ordem dos exercícios do treino",
            "items": {
                "type": "object",
                "properties": {
                    "id_exercicio": {
                        "type": "number",
                        "description": "O ID exato do exercício mapeado no exercise_catalog.json"
                    },
                    "ordem": {
                        "type": "number",
                        "description": "A ordem temporal deste exercício na sessão (1, 2, 3...)"
                    },
                    "series_aquecimento": {
                        "type": "number",
                        "description": "Quantas séries de aproximação/aquecimento (Feeder sets). Geralmente 1 ou 2 no 1º ex do dia."
                    },
                    "series_trabalho": {
                        "type": "number",
                        "description": "Working Sets: Séries reais feitas até a proximidade da falha (ex: 2 a 4)"
                    },
                    "reps_alvo": {
                        "type": "string",
                        "description": "Range alvo de repetições (ex: '6-8', '8-12', '12-15')"
                    },
                    "rir_alvo": {
                        "type": "number",
                        "description": "Reps in Reserve: Distância da falha. 0 = Falha total, 1-2 = Hipertrofia ideal, 3 = Aquecimento."
                    },
                    "rest_seconds": {
                        "type": "number",
                        "description": "Tempo de descanso em segundos (ex: 90, 120, 180). Compostos pesados pedem 180s."
                    },
                    "tecnica_avancada": {
                        "type": "string",
                        "description": "Opcional (null). Ex: 'Rest-Pause', 'Drop-Set', 'Bi-Set'."
                    }
                },
                "required": ["id_exercicio", "ordem", "series_aquecimento", "series_trabalho", "reps_alvo", "rir_alvo", "rest_seconds"]
            }
        }
    },
    "required": ["treino_nome", "objetivo_metabolico", "exercicios"]
};

export default workoutOutputSchema;
