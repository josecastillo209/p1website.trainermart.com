import { Router } from 'express';
import {
  getSessionCart,
  addToSessionCart,
  updateSessionCartItem,
  removeSessionCartItem,
} from '../controllers/cartController.js';

const router = Router();

router.get('/cart', getSessionCart);
router.post('/cart', addToSessionCart);
router.put('/cart/:itemId', updateSessionCartItem);
router.delete('/cart/:itemId', removeSessionCartItem);

export default router;