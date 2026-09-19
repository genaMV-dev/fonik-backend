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

// 1. Отримання ТІЛЬКИ МОЇХ оголошень (обов'язково ВИЩЕ за /phones/:phoneId)
router.get('/phones/my', authenticate, celebrate(getAllPhonesSchema), getMyPhones);

// 2. Отримання публічного каталогу без оголошень поточного юзера
router.get('/phones', optionalAuthenticate, celebrate(getAllPhonesSchema), getAllPhones); 

// 3. Отримання одного оголошення за ID
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

// Роути кошика
router.get(
  '/phones/basket',
  authenticate,
  getBasket,
);

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