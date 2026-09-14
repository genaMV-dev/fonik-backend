import { Joi, Segments } from 'celebrate';

export const paginationSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(100).default(12),
  }),
};

export const updateUserSchema = {
  [Segments.BODY]: Joi.object({
    username: Joi.string().trim().min(2).max(32),
  }).unknown(false),
};
