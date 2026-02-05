export interface ICoupon {
  code: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  expiryDate: Date;
  isActive: boolean;
}
