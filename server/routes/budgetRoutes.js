import express from 'express';

import {
  getBudget,
  setBudget,
  updateBudget
} from '../controllers/budgetController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', setBudget);
router.get('/', getBudget);
router.put('/', updateBudget);

export default router;