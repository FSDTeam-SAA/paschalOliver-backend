import Stripe from 'stripe';
import config from '../../config';
import { Professional } from '../professional/professional.model';
import { Payment } from './payment.model';
import AppError from '../../error/appError';
import { Coupon } from '../coupon/coupon.model';

const stripe = new Stripe(config.stripe.secretKey as string, {
  apiVersion: '2025-12-15.clover' as any,
});

const createPaymentIntent = async (
  userId: string,
  bookingId: string,
  professionalId: string,
  amount: number,
  couponCode?: string,
) => {
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

  let finalAmount = amount; // Start with original price
  let discountAmount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (coupon) {
      if (new Date(coupon.expiryDate) < new Date()) {
        throw new AppError(400, 'Coupon has expired');
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = (amount * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }

      finalAmount = amount - discountAmount;
      if (finalAmount < 0) finalAmount = 0;
    }
  }

  const amountInCents = Math.round(amount * 100);
  const adminFeeInCents = Math.round(amountInCents * 0.1);
  const professionalAmountInCents = amountInCents - adminFeeInCents;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    payment_method_types: ['card'],
    application_fee_amount: adminFeeInCents,
    transfer_data: {
      destination: professional.stripeAccountId,
    },

    metadata: {
      bookingId: bookingId,
      userId: userId,
      couponCode: couponCode || '',
    },
  });

  await Payment.create({
    transactionId: paymentIntent.id,
    user: userId,
    booking: bookingId,
    professional: professionalId,
    amount: finalAmount,
    discountAmount: discountAmount,
    adminFee: adminFeeInCents / 100,
    professionalAmount: professionalAmountInCents / 100,
    currency: 'usd',
    status: 'pending',
  });

  return {
    clientSecret: paymentIntent.client_secret,
    transactionId: paymentIntent.id,
    finalAmount: finalAmount,
    originalAmount: amount,
    discountApplied: discountAmount,
  };
};

const createOnboardingLink = async (professionalId: string) => {
  const professional =
    await Professional.findById(professionalId).populate('user');
  if (!professional) throw new AppError(404, 'Professional not found');

  let accountId = professional.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: (professional.user as any).email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    accountId = account.id;
    await Professional.findByIdAndUpdate(professionalId, {
      stripeAccountId: accountId,
    });
  }

  const REFRESH_URL = `${config.backendUrl}/api/v1/payment/onboarding/refresh`;
  const RETURN_URL = `${config.frontendUrl}/professional/dashboard`;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: REFRESH_URL,
    return_url: RETURN_URL,
    type: 'account_onboarding',
  });

  return { url: accountLink.url };
};

const getMyPayments = async (userId: string) => {
  const payments = await Payment.find({ status: 'completed' })
    .populate({
      path: 'booking',
      populate: {
        path: 'service',
        select: 'name',
      },
    })
    .sort({ createdAt: -1 });

  const myPayments = payments.filter(
    (payment: any) =>
      payment.booking && payment.booking.customer.toString() === userId,
  );

  return myPayments;
};

export const PaymentService = {
  createPaymentIntent,
  createOnboardingLink,
  getMyPayments,
};
