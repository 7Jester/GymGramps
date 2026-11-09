import express from 'express';
import { getDailyMissions, claimMission } from './missions.controller.js';

const router = express.Router();

router.get('/daily', getDailyMissions);
router.post('/claim', claimMission);

export default router;
