import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import notFoundError from './app/error/notFoundError';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes/routes';
import morgan from 'morgan';
import http from 'http';
import { initSocket } from './app/socket/server';
import { PaymentController } from './app/modules/payment/payment.controller';
import config from './app/config';
const app = express();
const serverInstance = http.createServer(app);

app.post(
  '/api/v1/payment/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook,
);

// Middlewares
app.use(morgan('dev'));
const allowedOrigins = (config.frontendUrl ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Application routes (Centralized router)
app.use('/api/v1', router);

// Root router
app.get('/', (req: Request, res: Response) => {
  res.status(200).send(`<h1>API is running successfully </h1>`);
});

// Not found route
app.use(notFoundError);

// Global error handler
app.use(globalErrorHandler);

const ioInstance = initSocket(serverInstance);

export const server = serverInstance;
export const io = ioInstance;
