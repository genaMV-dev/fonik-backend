import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  getPhonesInBasket,
  getUserPhones,
  getUserById,
  getUsers,
  getCurrentUser,
  updateCurrentUser,
  updateUserAvatar,
} from '../controllers/userController.js';
import { addToBasket, removeFromBasket } from '../controllers/phonesController.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadAvatar } from '../middleware/multer.js';
import {
  paginationSchema,
  updateUserSchema,
  userIdSchema,
} from '../validations/usersValidation.js';

const router = Router();

// Отримання поточного користувача
router.get('/users/me', authenticate, getCurrentUser);

// Оновлення аватара
router.patch('/users/avatar', authenticate, uploadAvatar, updateUserAvatar);

// Оновлення профілю (з можливістю завантаження аватара)
router.patch(
  '/users/me',
  authenticate,
  uploadAvatar,
  celebrate(updateUserSchema),
  updateCurrentUser
);

// Отримання користувачів та кошика
router.get('/users', getUsers);
router.get(
  '/users/me/phones-in-basket',
  authenticate,
  celebrate(paginationSchema),
  getPhonesInBasket
);

// Управління кошиком
router.post('/users/basket/:phoneId', authenticate, addToBasket);
router.delete('/users/basket/:phoneId', authenticate, removeFromBasket);

// Динамічні роути (завжди в кінці)
router.get(
  '/users/:id/phones',
  celebrate(userIdSchema),
  celebrate(paginationSchema),
  getUserPhones
);
router.get('/users/:id', celebrate(userIdSchema), getUserById);

export default router;