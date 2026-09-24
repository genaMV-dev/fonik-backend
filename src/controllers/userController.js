import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { Phone } from '../models/phone.js';

const parsePositiveInteger = (value, defaultValue) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return defaultValue;
  }

  return parsedValue;
};

export const getUsers = async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const perPage = Math.min(parsePositiveInteger(req.query.perPage, 20), 100);
  const skip = (page - 1) * perPage;

  const userQuery = User.find()
    .select('-password -email -phonesInBasket -__v')
    .sort({ createdAt: -1 });

  const [totalUsers, users] = await Promise.all([
    userQuery.clone().countDocuments(),
    userQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalUsers / perPage);

  res.status(200).json({
    page,
    perPage,
    totalUsers,
    totalPages,
    users,
  });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).select(
    '_id username email avatar',
  );

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({ user });
};

export const updateUserAvatar = async (req, res, next) => {
  const { file, user } = req;
  if (!file) {
    throw createHttpError(400, 'No file');
  }

  const result = await saveFileToCloudinary(file.buffer, user._id);

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    { avatar: result.secure_url },
    { returnDocument: 'after' },
  );

  res.status(200).json({ url: updatedUser.avatar });
};

export const buildUserProfileUpdate = async ({
  username,
  file,
  userId,
  uploadAvatar = saveFileToCloudinary,
}) => {
  const update = {};

  if (username !== undefined) {
    update.username = username;
  }

  if (file) {
    const result = await uploadAvatar(file.buffer, userId);
    update.avatar = result.secure_url;
  }

  if (Object.keys(update).length === 0) {
    throw createHttpError(400, 'Provide a username or avatar');
  }

  return update;
};

export const updateCurrentUser = async (req, res) => {
  const update = await buildUserProfileUpdate({
    username: req.body.username,
    file: req.file,
    userId: req.user._id,
  });

  const updatedUser = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  }).select('_id username email avatar');

  if (!updatedUser) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({ user: updatedUser });
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id }).select(
    '-password -email -phonesInBasket -__v',
  );

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({ user });
};

export const getUserPhones = async (req, res) => {
  const { id } = req.params;
  const { page = 1, perPage = 12 } = req.query;

  const skip = (page - 1) * perPage;

  const phoneQuery = Phone.find({
    userId: id,
  });

  const [totalPhones, phones] = await Promise.all([
    phoneQuery.clone().countDocuments(),
    phoneQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalPhones / perPage);

  res.status(200).json({
    page,
    perPage,
    totalPhones,
    totalPages,
    phones,
  });
};

export const getPhonesInBasket = async (req, res) => {
  const { page = 1, perPage = 12 } = req.query;

  const skip = (page - 1) * perPage;

  const phoneQuery = Phone.find({
    _id: { $in: req.user.phonesInBasket },
  });

  const [totalPhones, phones] = await Promise.all([
    phoneQuery.clone().countDocuments(),
    phoneQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalPhones / perPage);

  res.status(200).json({
    page,
    perPage,
    totalPhones,
    totalPages,
    phones,
  });
};