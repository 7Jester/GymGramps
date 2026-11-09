const EVO_METRICS = [
    { id: 'carga', label: 'Carga total', unit: 't', dec: 1, data: [18.4, 19.1, 18.8, 20.6, 21.3, 20.9, 22.4, 23.1, 23.8, 24.2, 25.6, 26.4] },
    { id: 'peso', label: 'Peso corporal', unit: 'kg', dec: 1, data: [68.2, 68.5, 68.4, 68.9, 69.3, 69.2, 69.8, 70.1, 70.4, 70.6, 71.2, 71.5] },
    { id: 'aderencia', label: 'Aderência ao plano', unit: '%', dec: 0, data: [62, 68, 71, 66, 74, 79, 77, 83, 86, 84, 89, 92] },
    { id: 'sono', label: 'Sono médio', unit: 'h', dec: 1, data: [6.1, 6.0, 6.4, 6.2, 6.6, 6.5, 6.8, 6.7, 7.0, 6.9, 7.1, 7.2] }
];

const EVO_PILLARS = [
    { name: 'Consistência', val: 92, note: '92%' },
    { name: 'Sobrecarga', val: 88, note: '+43%' },
    { name: 'Nutrição', val: 81, note: '81%' },
    { name: 'Recuperação', val: 64, note: '6,9 h', warn: true }
];
const EVO_INDEX = 84;
const EVO_VERDICT = 'Você está progredindo bem — o gargalo é o sono.';
const EVO_READ = 'Nas últimas 12 semanas a carga subiu 43% com peso corporal quase estável em ganho limpo (+0,27 kg/semana). O que segura seu Índice GG é a recuperação: 6,9 h de sono médio contra as 8 h que o seu volume atual pede.';


const EVO_DELTAS = [
    { name: 'Carga total por semana', was: 18.4, now: 26.4, unit: ' t', dec: 1 },
    { name: 'Agachamento · 5 rep', was: 70, now: 92.5, unit: ' kg', dec: 1 },
    { name: 'Supino reto · 5 rep', was: 52.5, now: 65, unit: ' kg', dec: 1 },
    { name: 'Treinos concluídos', was: 3, now: 6, unit: '/6', dec: 0 }
];

const EVO_MARKS = [
    { t: 'Novo recorde no agachamento', s: '92,5 kg × 5 — superou o antigo PR em 7,5 kg', w: 'S12' },
    { t: '12 semanas sem interromper o ciclo', s: 'Primeira vez que você fecha um bloco completo', w: 'S12' },
    { t: 'Meta calórica batida 6 dias seguidos', s: 'Média de 2.980 kcal contra a meta de 3.000', w: 'S11' },
    { t: '70 kg atingidos', s: '+3,3 kg desde o início do PPLUL, ganho de 0,27 kg/semana', w: 'S9' }
];
const EVO_NEXT = 'Próximo marco: <b>100 kg no agachamento</b> — faltam 7,5 kg. No ritmo atual, previsão para a <b>semana 15</b>.';


export const getSeries = async (req, res) => {
    try {
        const { semanas = 12 } = req.query;
        // In a real database, we would query up to 'semanas'. Here we return the mock data.
        res.json({ success: true, count: Number(semanas), series: EVO_METRICS });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getIndice = async (req, res) => {
    try {
        res.json({ success: true, index: EVO_INDEX, verdict: EVO_VERDICT, read: EVO_READ, pillars: EVO_PILLARS });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getDeltas = async (req, res) => {
    try {
        res.json({ success: true, deltas: EVO_DELTAS });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getMarcos = async (req, res) => {
    try {
        res.json({ success: true, marks: EVO_MARKS, next: EVO_NEXT });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
