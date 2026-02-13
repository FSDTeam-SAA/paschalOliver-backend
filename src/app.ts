import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import notFoundError from './app/error/notFoundError';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes/routes';
import morgan from 'morgan';
import http from 'http';
import { initSocket } from './app/socket/server';
import { PaymentController } from './app/modules/payment/payment.controller';

const app = express();
const serverInstance = http.createServer(app);

// Stripe webhook route (must be before body parsers)
app.post(
  '/api/v1/payment/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook,
);

// Middlewares
app.use(morgan('dev'));
app.use(cors({ origin: '*', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO and attach to app
const ioInstance = initSocket(serverInstance);
app.set('io', ioInstance); // ✅ CRITICAL: Attach io to Express app

// Application routes (Centralized router)
app.use('/api/v1', router);

// Root router
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('<h1>API is running successfully</h1>');
});

// Not found route
app.use(notFoundError);

// Global error handler
app.use(globalErrorHandler);

export const server = serverInstance;
export const io = ioInstance;
export default app;