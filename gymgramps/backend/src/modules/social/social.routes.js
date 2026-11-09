import express from 'express';
import { getLeaderboard, inviteFriend } from './social.controller.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.post('/invite', inviteFriend);

export default router;
