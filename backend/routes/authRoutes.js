import express from 'express';
import { register, login, getMe, createGovAccount } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Seed / admin-only: create government account
// Protect this with a secret header in production
router.post('/create-gov', createGovAccount);

export default router;
