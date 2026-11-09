import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.join(__dirname, '../../data/exercise_catalog.json');
const exerciseCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Mapa do ambiente Selecionado pelo usuário para as tags do Catálogo
const ambientMap = {
    'Academia': 'Academia',
    'Em casa': 'Em Casa',
    'Parque/Crossfit': 'Parque' // Puxa Parque ou Crossfit onde aplicável, mas simplificamos para Parque/Crossfit
};

function getExercises(groups, localStr, limit = 1) {
    const ambienteNecessario = ambientMap[localStr] || 'Academia';
    let selected = [];

    // Tentamos buscar para o local principal
    const available = exerciseCatalog.filter(ex => {
        let envMatch = ex.ambiente.includes(ambienteNecessario) || (localStr === 'Parque/Crossfit' && ex.ambiente.includes('Crossfit'));
        // Se for Em Casa e não achar muito, tentar mesclar peso corporal
        if (!envMatch && localStr === 'Em casa' && ex.equipamento === 'Peso Corporal') envMatch = true;
        return envMatch;
    });

    for (const group of groups) {
        // Encontrar os exercícios do grupo
        const groupExercises = available.filter(ex => ex.grupoMuscular === group || ex.sinergistas?.includes(group));

        // Evita duplicados no selected
        const notSelectedYet = groupExercises.filter(ex => !selected.find(s => s.id === ex.id));

        for (let i = 0; i < limit; i++) {
            if (notSelectedYet[i]) {
                selected.push(notSelectedYet[i]);
            }
        }
    }
    return selected;
}

function formatGroup(exercicios, series, reps, rest, extraObs = '') {
    return exercicios.map(ex => ({
        nomeExercicio: ex.nome,
        seriesAlvo: series,
        repsAlvo: reps,
        percentualPeso: "Ajustar carga pesada (RIR 1-2)",
        observacao: `Descanso ${rest}. ${ex.mecanica}. ${extraObs}`
    }));
}

function fatLossCardioDay() {
    return {
        nome: "Cardio Moderado ou HIIT",
        aquecimento: "Caminhada leve de 5 min.",
        exercicios: [
            {
                nomeExercicio: "Cardio de sua preferência (Esteira, Bike, Corrida)",
                seriesAlvo: 1,
                repsAlvo: "35 a 45 min",
                percentualPeso: "Intensidade Moderada (Zona 2/3)",
                observacao: "Mantenha a frequência cardíaca constante. Ideal para gasto calórico e preservação de massa magra."
            }
        ]
    };
}

export function generateStaticTreino(perfil, frequencia, local) {
    const objetivo = perfil.objetivo || 'ganho_massa';
    const freq = Number(frequencia) || 5;

    let divisaoName = "";
    let diasTreinoList = [];

    // LÓGICA DE GANHO DE MASSA E RECOMPOSIÇÃO
    if (objetivo === 'ganho_massa' || objetivo === 'manutencao') {
        const isRecomp = objetivo === 'manutencao';

        if (freq <= 3) {
            divisaoName = "Full Body (Corpo Inteiro)";
            const fbDayTemplate = (nomeDia) => {
                const ex = getExercises(['Quadríceps', 'Posterior de Coxa', 'Peitoral', 'Dorsal', 'Deltoide', 'Abdômen'], local, 1);
                return {
                    nome: nomeDia,
                    aquecimento: "5 min de mobilidade e leve elevação cardíaca.",
                    exercicios: formatGroup(ex, 3, "8-12", "90s")
                };
            };
            for (let i = 1; i <= freq; i++) diasTreinoList.push(fbDayTemplate(`Full Body ${i}`));

        } else if (freq === 4) {
            divisaoName = "Treino AB (Upper / Lower)";
            const upperEx = getExercises(['Peitoral', 'Dorsal', 'Deltoide', 'Bíceps', 'Tríceps'], local, 1);
            const lowerEx = getExercises(['Quadríceps', 'Posterior de Coxa', 'Quadríceps', 'Panturrilha', 'Abdômen'], local, 1);

            diasTreinoList = [
                { nome: "Treino A - Inferiores (Força)", aquecimento: "Mobilidade pélvica.", exercicios: formatGroup(lowerEx, 4, "6-10", "120s") },
                { nome: "Treino B - Superiores (Controle)", aquecimento: "Aquecimento de manguito.", exercicios: formatGroup(upperEx, 3, "8-12", "90s") },
                { nome: "Treino C - Inferiores (Volume)", aquecimento: "Mobilidade.", exercicios: formatGroup(lowerEx, 3, "12-15", "90s") },
                { nome: "Treino D - Superiores (Pump)", aquecimento: "Manguito.", exercicios: formatGroup(upperEx, 3, "12-15", "90s") }
            ];

        } else {
            // 5 ou 6 dias
            if (isRecomp) {
                divisaoName = "Push / Pull / Legs + Upper / Lower";
                const push = getExercises(['Peitoral', 'Deltoide', 'Tríceps'], local, 2);
                const pull = getExercises(['Dorsal', 'Dorsal', 'Bíceps'], local, 2);
                const legs = getExercises(['Quadríceps', 'Posterior de Coxa', 'Panturrilha'], local, 2);
                const upper = getExercises(['Peitoral', 'Dorsal', 'Deltoide'], local, 1);
                const lower = getExercises(['Quadríceps', 'Posterior de Coxa', 'Glúteo'], local, 1);

                diasTreinoList = [
                    { nome: "Push (Empurrar)", aquecimento: "Mobilidade articular ombros.", exercicios: formatGroup(push, 3, "8-12", "90s") },
                    { nome: "Pull (Puxar)", aquecimento: "Escápulas.", exercicios: formatGroup(pull, 3, "8-12", "90s") },
                    { nome: "Legs (Pernas)", aquecimento: "Mobilidade quadril.", exercicios: formatGroup(legs, 4, "8-10", "120s") },
                    { nome: "Upper (Membros Superiores)", aquecimento: "Manguito.", exercicios: formatGroup(upper, 3, "10-15", "60s") },
                    { nome: "Lower (Membros Inferiores)", aquecimento: "Pernas.", exercicios: formatGroup(lower, 3, "10-15", "60s") }
                ];
                if (freq === 6) diasTreinoList.push({ nome: "Full Body Leve", aquecimento: "Leve.", exercicios: formatGroup(getExercises(['Quadríceps', 'Peitoral', 'Dorsal'], local, 1), 3, "15", "60s", "Opcional p/ fluxo sanguíneo.") });
            } else {
                divisaoName = "Treino ABC (Peito/Tríc, Costas/Bíc, Pernas)";
                const a = getExercises(['Peitoral', 'Peitoral', 'Tríceps', 'Tríceps', 'Deltoide Anterior'], local, 1);
                const b = getExercises(['Dorsal', 'Dorsal', 'Bíceps', 'Bíceps', 'Deltoide Posterior'], local, 1);
                const c = getExercises(['Quadríceps', 'Posterior de Coxa', 'Glúteo', 'Panturrilha', 'Abdômen'], local, 1);

                diasTreinoList = [
                    { nome: "Treino A - Peito, Ombro Frontal e Tríceps", aquecimento: "Manguito.", exercicios: formatGroup(a, 3, "8-12", "90s") },
                    { nome: "Treino B - Costas, Ombro Post. e Bíceps", aquecimento: "Escápulas.", exercicios: formatGroup(b, 3, "8-12", "90s") },
                    { nome: "Treino C - Pernas Completas e Abdômen", aquecimento: "Quadril.", exercicios: formatGroup(c, 4, "8-10", "120s") },
                    { nome: "Treino A2 - Peito e Tríceps (Volume)", aquecimento: "Manguito.", exercicios: formatGroup(a, 3, "12-15", "60s") },
                    { nome: "Treino B2 - Costas e Bíceps (Volume)", aquecimento: "Escápulas.", exercicios: formatGroup(b, 3, "12-15", "60s") }
                ];
                if (freq === 6) diasTreinoList.push({ nome: "Treino C2 - Pernas Foco Posterior", aquecimento: "Quadril.", exercicios: formatGroup(c, 3, "12-15", "90s") });
            }
        }
    }
    // LÓGICA DE PERDA DE GORDURA
    else if (objetivo === 'perda_gordura') {
        divisaoName = "Híbrido de Força e Cardio";
        const respsFatLoss = "10-15"; // mais repetições, mais gasto metabólico local (opcional, força é vital também)

        const fullBodyCards = getExercises(['Quadríceps', 'Peitoral', 'Dorsal', 'Posterior de Coxa', 'Deltoide'], local, 1);
        const lowerEx = getExercises(['Quadríceps', 'Posterior de Coxa', 'Glúteo', 'Panturrilha', 'Abdômen'], local, 1);
        const upperEx = getExercises(['Peitoral', 'Dorsal', 'Deltoide', 'Bíceps', 'Tríceps'], local, 1);

        if (freq === 3) {
            diasTreinoList = [
                { nome: "Treino 1 - Full Body Força", aquecimento: "5 min alongamento ativo.", exercicios: formatGroup(fullBodyCards, 3, respsFatLoss, "60s", "Foco em manter contração.") },
                fatLossCardioDay(),
                { nome: "Treino 2 - Full Body Hipertrofia", aquecimento: "Mobilidade.", exercicios: formatGroup(fullBodyCards, 3, "8-12", "90s") },
            ];
        } else if (freq === 4) {
            diasTreinoList = [
                { nome: "Treino 1 - Membros Inferiores", aquecimento: "Mobilidade.", exercicios: formatGroup(lowerEx, 3, respsFatLoss, "90s") },
                { nome: "Treino 2 - Membros Superiores", aquecimento: "Manguito.", exercicios: formatGroup(upperEx, 3, respsFatLoss, "90s") },
                fatLossCardioDay(),
                { nome: "Treino 3 - Full Body Metabólico", aquecimento: "Geral.", exercicios: formatGroup(fullBodyCards, 3, "15-20", "45s") },
            ];
        } else {
            // 5 ou 6 dias
            diasTreinoList = [
                { nome: "Dia 1 - Força Membros Inferiores", aquecimento: "Mobilidade.", exercicios: formatGroup(lowerEx, 3, "10-12", "90s") },
                fatLossCardioDay(),
                { nome: "Dia 3 - Força Membros Superiores", aquecimento: "Manguito.", exercicios: formatGroup(upperEx, 3, "10-12", "90s") },
                fatLossCardioDay(),
                { nome: "Dia 5 - Full Body Metabólico", aquecimento: "Geral.", exercicios: formatGroup(fullBodyCards, 3, "12-15", "60s") },
            ];
            if (freq === 6) {
                diasTreinoList.push({ nome: "Dia 6 - Circuito Core/Abdômen", aquecimento: "Cardio leve.", exercicios: formatGroup(getExercises(['Abdômen'], local, 4), 3, "Máximo", "45s") });
            }
        }
    }

    return {
        divisao: divisaoName,
        diasPorSemana: freq,
        treinoDia: diasTreinoList
    };
}
