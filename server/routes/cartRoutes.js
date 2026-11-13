import { Router } from 'express';
import { getCart, addCartItem, updateCartItem, deleteCartItem } from '../controllers/cartController.js';

const router = Router();

router.get('/cart', getCart);
router.post('/cart', addCartItem);
router.put('/cart/:itemId', updateCartItem);
router.delete('/cart/:itemId', deleteCartItem);

export default router;