/**
 * DietAdvisor - Deterministic Nutrition Analytics
 * 
 * Simula um "Nutricionista Virtual" verificando se os macronutrientes consumidos 
 * estouram (overshoot) a taxa de gorduras/carbs, ou atingem a meta proteica.
 */

export function analyzeNutrition(totalConsumed, dailyGoal) {
    if (!dailyGoal || !totalConsumed || !dailyGoal.macros) return null;

    // Margem de tolerância (5%)
    const fatLimit = dailyGoal.macros.gorduraG * 1.05;
    const proTarget = dailyGoal.macros.proteinaG * 0.90; // Bateu 90% da meta já é excelente
    const proMax = dailyGoal.macros.proteinaG * 1.30; // Proteína excessiva
    const carbLimit = dailyGoal.macros.carboG * 1.05;

    // 1. Alerta Crítico Absoluto: Excesso de Gordura
    if (totalConsumed.gorduraG > fatLimit) {
        return {
            type: 'danger',
            message: "Alerta! Você atingiu ou passou do limite de gorduras do dia. Recomendamos que segure óleos, pastas e queijos amarelos nas próximas refeições!"
        };
    }

    // 2. Alerta de Carboidratos
    if (totalConsumed.carboG > carbLimit) {
        return {
            type: 'warning',
            message: "Você já bateu sua meta de carboidratos diários. Tente manter as próximas refeições baseadas apenas em proteínas magras e saladas."
        };
    }

    // 3. Sucesso Absoluto (Bateu proteína sem estourar carb/fat)
    if (totalConsumed.proteinaG >= proTarget && totalConsumed.proteinaG <= proMax) {
        return {
            type: 'success',
            message: "Parabéns! Sua cota de construção muscular (proteína) foi devidamente batida hoje. Excelente trabalho de aderência!"
        };
    }

    // 4. Progresso Saudável
    return {
        type: 'info',
        message: "Refeição rastreada! Os macros continuam dentro da margem segura do dia. Pode prosseguir sem preocupação."
    };
}
