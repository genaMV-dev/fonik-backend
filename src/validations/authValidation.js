import { Joi, Segments } from 'celebrate';

export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    username: Joi.string().trim().min(2).max(32).required(),
    email: Joi.string().trim().lowercase().email().max(64).required(),
    password: Joi.string().min(8).max(64).required(),
  }),
};

export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().trim().lowercase().email().max(64).required(),
    password: Joi.string().min(8).max(64).required(),
  }),
};