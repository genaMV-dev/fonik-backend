import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js';
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
        `${Date.now()}_${req.user._id}`
      );
      req.body.photo = result.secure_url;
    }
    next();
  } catch (error) {
    next(error);
  }
};

// 1. Отримання ТІЛЬКИ МОЇХ оголошень (статичний шлях "/my" повинен іти РАНІШЕ за "/:phoneId")
router.get('/my', authenticate, celebrate(getAllPhonesSchema), getMyPhones);

// 2. Отримання оголошень інших користувачів (працює і для гостей, і для авторизованих)
router.get('/', optionalAuthenticate, celebrate(getAllPhonesSchema), getAllPhones);

// 3. Отримання одного оголошення за ID
router.get('/:phoneId', celebrate(phoneIdSchema), getPhoneById);

// Створення, оновлення та видалення оголошення
router.post(
  '/',
  authenticate,
  upload.single('photo'),
  attachPhonePhotoUrl,
  celebrate(createPhoneSchema),
  createPhone
);

router.patch(
  '/:phoneId',
  authenticate,
  upload.single('photo'),
  attachPhonePhotoUrl,
  celebrate(phoneIdSchema),
  celebrate(updatePhoneSchema),
  updatePhone
);

router.delete('/:phoneId', authenticate, celebrate(phoneIdSchema), deletePhoneById);

// Роути для кошика
router.post('/:phoneId/basket', authenticate, celebrate(phoneIdSchema), addToBasket);

router.delete(
  '/:phoneId/basket',
  authenticate,
  celebrate(phoneIdSchema),
  removeFromBasket
);

export default router;
