import 'dotenv/config';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import express from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import { logger } from './middleware/logger.js';
import { connectMongoDB } from './db/connectMongoDB.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errors } from 'celebrate';
import authRoutes from './routes/authRoutes.js';
import phonesRoutes from './routes/phonesRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(cookieParser());

app.use(authRoutes);
app.use(phonesRoutes);
app.use(userRoutes);

app.use(notFoundHandler);

app.use(errors());
app.use(errorHandler);
await connectMongoDB();

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on: ${process.env.PORT || 3000}`);
});
