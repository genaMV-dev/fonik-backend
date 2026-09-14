import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { BUTTERY, CONDITIONS, INUSE, STORAGE } from '../constants/phoneConst.js';

export const getAllPhonesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(12),
  }),
};

export const createPhoneSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(3).max(48).trim().required(),
    description: Joi.string().min(10).max(4000).trim().required(),
    price: Joi.number().min(0).integer().required(),
    photo: Joi.string().required(),
    author: Joi.string().min(2).max(50).required(),
    storage: Joi.number().valid(...STORAGE),
    buttery: Joi.string().valid(...BUTTERY),
    inUse: Joi.string().valid(...INUSE),
    conditions: Joi.string().valid(...CONDITIONS),
  }),
};

export const updatePhoneSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(3).max(48).trim(),
    description: Joi.string().min(10).max(4000).trim(),
    photo: Joi.string(),
    author: Joi.string().min(2).max(50),
    storage: Joi.number().valid(...STORAGE),
    buttery: Joi.string().valid(...BUTTERY),
    inUse: Joi.string().valid(...INUSE),
    conditions: Joi.string().valid(...CONDITIONS),
  }),
};

const objIdValidator = (value, helpers) => {
  if (isValidObjectId(value)) {
    return value;
  }

  return helpers.message('Bad id format');
};

export const phoneIdSchema = {
  [Segments.PARAMS]: Joi.object({
    phoneId: Joi.string().custom(objIdValidator).required(),
  }),
};
