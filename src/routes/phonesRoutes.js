import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js'; // або optionalAuthenticate
import { upload } from '../middleware/multer.js';
import { savePhonePhotoToCloudinary } from '../utils/saveFileToCloudinary.js'; 
import {
  createPhone,
  getAllPhones,
  getMyPhones, 
  getPhoneById,
  deletePhoneById,
  updatePhone,
  addToBasket,
  removeFromBasket,
} from '../controllers/phonesController.js'; 
import {
  phoneIdSchema,
  createPhoneSchema,
  getAllPhonesSchema,
  updatePhoneSchema,
} from '../validations/phonesValidation.js'; 

const router = Router();

const attachPhonePhotoUrl = async (req, res, next) => {
  try {
    if (req.file) {
      const result = await savePhonePhotoToCloudinary(
        req.file.buffer,
        `${Date.now()}_${req.user._id}`,
      );
      req.body.photo = result.secure_url;
    }
    next();
  } catch (error) {
    next(error);
  }
};

// 1. Отримання ТІЛЬКИ МОЇХ оголошень (потрібна обов'язкова авторизація)
router.get('/phones/my', authenticate, celebrate(getAllPhonesSchema), getMyPhones);

// 2. Отримання чужих оголошень (якщо користувач залогінений, перевіряємо req.user)
router.get('/phones', authenticate, celebrate(getAllPhonesSchema), getAllPhones); 

router.get('/phones/:phoneId', celebrate(phoneIdSchema), getPhoneById);

// Створення, оновлення та видалення оголошення
router.post(
  '/phones',
  authenticate,
  upload.single('photo'),
  attachPhonePhotoUrl,
  celebrate(createPhoneSchema),
  createPhone,
);

router.patch(
  '/phones/:phoneId',
  celebrate(phoneIdSchema),
  authenticate,
  upload.single('photo'),
  attachPhotoUrl,
  celebrate(updatePhoneSchema),
  updatePhone,
);

router.delete(
  '/phones/:phoneId',
  celebrate(phoneIdSchema),
  authenticate,
  deletePhoneById,
);

// Роути для кошика (додавання / видалення)
router.post(
  '/phones/:phoneId/basket',
  authenticate,
  celebrate(phoneIdSchema),
  addToBasket,
);

router.delete(
  '/phones/:phoneId/basket',
  authenticate,
  celebrate(phoneIdSchema),
  removeFromBasket,
);

export default router;