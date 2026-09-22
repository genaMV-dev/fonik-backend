import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js'; 
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
  getBasket,
} from '../controllers/phonesController.js'; 
import {
  phoneIdSchema,
  createPhoneSchema,
  getAllPhonesSchema,
  updatePhoneSchema,
} from '../validations/phonesValidation.js'; 

const router = Router();

const optionalAuthenticate = (req, res, next) => {
  authenticate(req, res, (err) => {
    next();
  });
};

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

// ========================================================
// 1. СТАТИЧНІ ТА СПЕЦІАЛЬНІ МАРШРУТИ (Обов'язково ВИЩЕ за :phoneId)
// ========================================================

// Отримання ТІЛЬКИ МОЇХ оголошень
router.get('/phones/my', authenticate, celebrate(getAllPhonesSchema), getMyPhones);

// Отримання кошика користувача
router.get('/phones/basket', authenticate, getBasket);

// Отримання публічного каталогу
router.get('/phones', optionalAuthenticate, celebrate(getAllPhonesSchema), getAllPhones); 

// Створення оголошення
router.post(
  '/phones',
  authenticate,
  upload.single('photo'),
  attachPhonePhotoUrl,
  celebrate(createPhoneSchema),
  createPhone,
);

// ========================================================
// 2. ДИНАМІЧНІ МАРШРУТИ З ПАРАМЕТРОМ :phoneId
// ========================================================

// Отримання одного оголошення за ID
router.get('/phones/:phoneId', celebrate(phoneIdSchema), getPhoneById);

// Додавання/Видалення з кошика
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

// Оновлення та видалення оголошення
router.patch(
  '/phones/:phoneId',
  authenticate,
  upload.single('photo'),
  attachPhonePhotoUrl,
  celebrate(phoneIdSchema),
  celebrate(updatePhoneSchema),
  updatePhone,
);

router.delete(
  '/phones/:phoneId',
  authenticate,
  celebrate(phoneIdSchema),
  deletePhoneById,
);

export default router;