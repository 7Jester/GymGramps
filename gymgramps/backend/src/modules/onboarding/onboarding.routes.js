import { Router } from 'express';
import { gerarTreino, gerarDieta, gerarCronograma, gerarPlanoFinal, sugerirSubstituicao } from './onboarding.controller.js';

const router = Router();

router.post('/gerar-treino', gerarTreino);
router.post('/gerar-dieta', gerarDieta);
router.post('/gerar-cronograma', gerarCronograma);
router.post('/gerar-plano-final', gerarPlanoFinal);
router.post('/sugerir-substituicao', sugerirSubstituicao);

export default router;
