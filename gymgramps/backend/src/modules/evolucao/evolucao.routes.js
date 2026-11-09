import express from 'express';
import {
    getSeries,
    getIndice,
    getDeltas,
    getMarcos
} from './evolucao.controller.js';
import { getChartData } from './stats.controller.js';

const router = express.Router();

router.get('/series', getSeries);
router.get('/indice', getIndice);
router.get('/deltas', getDeltas);
router.get('/marcos', getMarcos);
router.get('/charts', getChartData);

export default router;
