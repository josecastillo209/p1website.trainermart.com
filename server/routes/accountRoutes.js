import { Router } from 'express';
import {
  createAccount,
  login,
  getAccount,
  logout,
  updateAccount,
} from '../controllers/accountController.js';

const router = Router();

router.post('/accounts', createAccount);
router.post('/login', login);
router.get('/account', getAccount);
router.put('/account', updateAccount);
router.post('/logout', logout);

export default router;