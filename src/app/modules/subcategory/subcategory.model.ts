import { model, Schema } from 'mongoose';
import { ISubcategory } from './subcategory.interface';

const subcategorySchema = new Schema<ISubcategory>(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    serviceId: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const Subcategory = model<ISubcategory>(
  'Subcategory',
  subcategorySchema,
);
