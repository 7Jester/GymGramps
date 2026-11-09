/**
 * ProgressionAdvisor
 * 
 * Algoritmo matemático determinístico de sobrecarga progressiva (Progressive Overload).
 * Ele lê as repetições realizadas versus o range alvo e calcula se o usuário deve 
 * manter, reduzir ou aumentar a carga na próxima série/treino.
 */

export function analyzeSetPerformance(targetRepsStr, performedReps, currentLoad) {
    // Parser do target (Ex: "6-8" ou "10-12")
    let minReps = 0;
    let maxReps = 0;

    if (typeof targetRepsStr === 'string' && targetRepsStr.includes('-')) {
        const parts = targetRepsStr.split('-');
        minReps = parseInt(parts[0], 10);
        maxReps = parseInt(parts[1], 10);
    } else {
        // Se for passado um número ou string simples (ex: "8" ou "Falha")
        minReps = parseInt(targetRepsStr, 10) || 8;
        maxReps = minReps + 2; // tolerância
    }

    const reps = parseInt(performedReps, 10);
    const weight = parseFloat(currentLoad) || 0;

    if (!reps || isNaN(reps)) return null;

    // Regra 1: Undershoot (Abaixo da Meta)
    if (reps < minReps) {
        if (weight > 0) {
            // Drop de ~10% na carga
            const suggestedWeight = Math.max(0, (weight * 0.9)).toFixed(1).replace('.0', '');
            return {
                status: 'drop',
                message: "Peso alto! Reduza a carga para aprox. " + suggestedWeight + "kg para atingir a zona anabólica (" + minReps + " a " + maxReps + " reps)."
            };
        } else {
            return { status: 'drop', message: 'Abaixo da meta! Descanse mais tempo ou facilite a execução no próximo set.' };
        }
    }

    // Regra 2: Overshoot (Acima da Meta)
    if (reps > maxReps) {
        if (weight > 0) {
            // Progressive overload de ~5% (Conservador para evitar lesão)
            const suggestedWeight = (weight * 1.05).toFixed(1).replace('.0', '');
            return {
                status: 'increase',
                message: "Carga superada! O exercício ficou leve, suba a carga para aprox. " + suggestedWeight + "kg no próximo treino/série."
            };
        } else {
            return { status: 'increase', message: 'Ótimo condicionamento! Dificulte o movimento (cadência/amplitude) na próxima vez.' };
        }
    }

    // Regra 3: Sweet Spot (Dentro da Meta)
    return {
        status: 'hold',
        message: "Carga ideal! Tente chegar o mais próximo da falha possível (Push " + (reps + 1) + ") mantendo esse peso na próxima."
    };
}
