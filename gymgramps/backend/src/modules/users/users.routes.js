import { Router } from 'express';
import { deleteAccount } from './users.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = Router();

router.delete('/me', authMiddleware, deleteAccount);

export default router;
