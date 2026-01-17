import { Schema, model } from 'mongoose';
import { IFavorite } from './favorite.interface';

const favoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    professional: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Favorite = model<IFavorite>('Favorite', favoriteSchema);
