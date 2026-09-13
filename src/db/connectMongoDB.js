import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    const url = process.env.MONGO_URL;
    await mongoose.connect(url);
    console.log('✅Good');
  } catch (error) {
    console.log('❌Oops', error);
    process.exit(1);
  }
};