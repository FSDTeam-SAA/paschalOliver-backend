import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';
import { Payment } from './payment.model';
import Stripe from 'stripe';
import config from '../../config';
import AppError from '../../error/appError';
import { Booking } from '../booking/booking.model';

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { amount, professionalId, bookingId, couponCode } = req.body;
  const userId = req.user.id;

  const result = await PaymentService.createPaymentIntent(
    userId,
    bookingId,
    professionalId,
    amount,
    couponCode,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment intent created successfully',
    data: result,
  });
});

const createOnboardingLink = catchAsync(async (req: Request, res: Response) => {
  const { professionalId } = req.body;

  const result = await PaymentService.createOnboardingLink(professionalId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Onboarding link generated successfully',
    data: result,
  });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  const stripe = new Stripe(config.stripe.secretKey as string, {
    apiVersion: '2025-12-15.clover' as any,
  });

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      config.stripe.webhookSecret as string,
    );
  } catch (err: any) {
    throw new AppError(400, `Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const receiptUrl = (paymentIntent as any).charges?.data[0]?.receipt_url;

    await Payment.findOneAndUpdate(
      { transactionId: paymentIntent.id },
      { status: 'completed', receiptUrl: receiptUrl },
    );
    const bookingId = paymentIntent.metadata.bookingId;
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });
    }
  }

  res.status(200).json({ received: true });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await PaymentService.getMyPayments(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My payments retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  createPaymentIntent,
  createOnboardingLink,
  handleStripeWebhook,
  getMyPayments,
};
