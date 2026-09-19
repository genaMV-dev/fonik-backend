import { Phone } from '../models/phone.js';
import { User } from '../models/user.js';
import createHttpError from 'http-errors';

export const getAllPhones = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const currentUserId = req.user?._id;

  const filter = currentUserId ? { userId: { $ne: currentUserId } } : {};

  const [totalPhones, phones] = await Promise.all([
    Phone.countDocuments(filter),
    Phone.find(filter).skip(skip).limit(Number(perPage)),
  ]);

  const totalPages = Math.ceil(totalPhones / perPage);

  return res.status(200).json({
    page: Number(page),
    perPage: Number(perPage),
    totalPhones,
    totalPages,
    phones,
  });
};

export const getMyPhones = async (req, res) => {
  // 1. Приводимо значення з req.query до чисел
  const pageNumber = Number(req.query.page) || 1;
  const limitNumber = Number(req.query.perPage) || 10;

  // 2. Розраховуємо skip з числовими значеннями
  const skip = (pageNumber - 1) * limitNumber;
  const userId = req.user._id;

  const [totalPhones, phones] = await Promise.all([
    Phone.countDocuments({ userId }),
    Phone.find({ userId }).skip(skip).limit(limitNumber),
  ]);

  const totalPages = Math.ceil(totalPhones / limitNumber);

  return res.status(200).json({
    page: pageNumber,
    perPage: limitNumber,
    totalPhones,
    totalPages,
    phones,
  });
};

export const getPhoneById = async (req, res) => {
  const { phoneId } = req.params;
  const phone = await Phone.findById(phoneId);

  if (!phone) {
    throw createHttpError(404, 'Phone not found');
  }

  res.status(200).json(phone);
};

export const deletePhoneById = async (req, res) => {
  const { phoneId } = req.params;
  const userId = req.user._id;

  const phone = await Phone.findById(phoneId);

  if (!phone) {
    throw createHttpError(404, 'Phone not found');
  }

  if (phone.userId.toString() !== userId.toString()) {
    throw createHttpError(403, 'No rights to delete this phone listing');
  }

  await Phone.findByIdAndDelete(phoneId);

  res.status(200).json({
    message: 'Phone listing deleted successfully',
  });
};

export const createPhone = async (req, res) => {
  const phone = await Phone.create({
    ...req.body,
    userId: req.user._id,
  });

  res.status(201).json(phone);
};

export const updatePhone = async (req, res) => {
  const { phoneId } = req.params;

  const updatedPhone = await Phone.findOneAndUpdate(
    { _id: phoneId, userId: req.user._id }, // Оновлюємо тільки якщо оголошення належить користувачу
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedPhone) {
    throw createHttpError(404, 'Phone not found or unauthorized');
  }

  res.status(200).json(updatedPhone);
};

export const getBasket = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('phonesInBasket');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.phonesInBasket);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch basket items', error: error.message });
  }
};

export const addToBasket = async (req, res) => {
  const { phoneId } = req.params;
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, {
    $addToSet: {
      phonesInBasket: phoneId,
    },
  });

  res.status(200).json({
    message: 'Phone added to basket',
  });
};

export const removeFromBasket = async (req, res) => {
  const { phoneId } = req.params;
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, {
    $pull: {
      phonesInBasket: phoneId,
    },
  });

  res.status(200).json({
    message: 'Phone removed from basket',
  });
};
