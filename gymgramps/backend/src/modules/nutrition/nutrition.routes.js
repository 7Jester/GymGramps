import express from 'express';
import { analyzeDish } from './nutrition.controller.js';

const router = express.Router();

router.post('/analyze-dish', analyzeDish);

export default router;
