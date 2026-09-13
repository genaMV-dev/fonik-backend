import { Schema, model } from 'mongoose';
import { BUTTERY, CONDITIONS, INUSE, STORAGE } from '../constants/phoneConst.js';

const phoneSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    storage: {
      type: Number,
      enum: STORAGE,
      required: true,
    },
    buttery: {
      type: String,
      enum: BUTTERY,
      required: true,
    },
    inUse: {
      type: String,
      enum: INUSE,
      required: true,
    },
    conditions: {
      type: String,
      enum: CONDITIONS,
      required: true,
    },
    author: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Phone = model('Phone', phoneSchema);
