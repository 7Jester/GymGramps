import express from 'express';
import { submitSurvey, syncHealthData } from './tracker.controller.js';

const router = express.Router();

router.post('/survey', submitSurvey);
router.post('/health-sync', syncHealthData);

export default router;
