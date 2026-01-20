import Stripe from 'stripe';
import config from '../../config';
import { Professional } from '../professional/professional.model';
import AppError from '../../error/appError';

const stripe = new Stripe(config.stripe.secretKey as string, {
  apiVersion: '2025-12-15.clover' as any,
});

const createPaymentIntent = async (amount: number, professionalId: string) => {
  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throw new AppError(404, 'Professional not found');
  }
  if (!professional.stripeAccountId) {
    throw new AppError(
      400,
      'Professional has not set up their payment method yet.',
    );
  }

  const amountInCents = Math.round(amount * 100);
  const adminFeeInCents = Math.round(amountInCents * 0.1);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    payment_method_types: ['card'],
    application_fee_amount: adminFeeInCents,
    transfer_data: {
      destination: professional.stripeAccountId,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    transactionId: paymentIntent.id,
  };
};

export const PaymentService = {
  createPaymentIntent,
};
