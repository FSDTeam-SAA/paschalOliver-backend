import { Schema, Types, model } from 'mongoose';
import { IBooking } from './booking.interface';

const bookingSchema = new Schema<IBooking>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    professional: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    scheduleType: {
      type: String,
      enum: ['weekly', 'biweekly', 'just_once'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    durationInMinutes: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'in_progress',
        'completed',
        'cancelled_by_client',
        'cancelled_by_professional',
      ],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

// Post-save hook to automatically create RequestHistory
bookingSchema.post('save', async function (doc) {
  try {
    // Import here to avoid circular dependency
    const { RequestHistory } = await import(
      '../Requests_history/requestHistory.model'
    );

    // Map booking status to request history status
    let historyStatus = 'new';
    if (doc.status === 'accepted') historyStatus = 'accepted';
    else if (doc.status === 'completed') historyStatus = 'completed';
    else if (doc.status === 'cancelled_by_client') {
      historyStatus = 'cancelled_by_client';
    } else if (doc.status === 'cancelled_by_professional') {
      historyStatus = 'cancelled_by_professional';
    }

    // Check if request history already exists for this booking
    const existingHistory = await RequestHistory.findOne({ booking: doc._id });

    if (!existingHistory) {
      // Create new request history only if it doesn't exist
      await RequestHistory.create({
        booking: doc._id,
        customer: doc.customer,
        professional: doc.professional,
        service: doc.service,
        address: doc.address,
        status: historyStatus,
      });
    } else {
      // Update existing request history if booking status changed
      existingHistory.status = historyStatus as any;
      existingHistory.professional = doc.professional as Types.ObjectId;
      await existingHistory.save();
    }
  } catch (error) {
    console.error('Error creating/updating request history:', error);
    // Don't throw error to prevent booking creation from failing
  }
});

export const Booking = model<IBooking>('Booking', bookingSchema);
