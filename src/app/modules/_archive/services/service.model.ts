import { model, Schema } from 'mongoose';
import { IService } from './service.interface';
import AppError from '../../../error/appError';

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    image: { type: String, required: false },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true,
    },
    serviceType: {
      type: [String],
      default: [],
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

//pre check title cant be duplicate
serviceSchema.pre('save', async function (next) {
  const title: string = this.title;
  const duplicate = await Service.findOne({ title: title });
  if (duplicate) {
    throw new AppError(409, `Service with title ${title} already exists`);
  }
  next();
});

//update title cant be duplicate
serviceSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  const title = update.title ?? update.$set?.title;

  const duplicate = await Service.findOne({ title: title });
  if (duplicate) {
    throw new AppError(409, `Service with title ${title} already exists`);
  }
  next();
});

export const Service = model<IService>('Service', serviceSchema);
