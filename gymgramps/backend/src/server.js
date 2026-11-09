import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import onboardingRoutes from './modules/onboarding/onboarding.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import evolucaoRoutes from './modules/evolucao/evolucao.routes.js';
import nutritionRoutes from './modules/nutrition/nutrition.routes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/evolucao', evolucaoRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/admin', adminRoutes);

import trackerRoutes from './modules/tracker/tracker.routes.js';

import missionsRoutes from './modules/gamification/missions.routes.js';
import socialRoutes from './modules/social/social.routes.js';

const PORT = process.env.PORT || 3000;
app.use('/api/tracker', trackerRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/social', socialRoutes);
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
