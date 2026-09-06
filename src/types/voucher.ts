export type VoucherSource = 'AFFILIATE' | 'DIRECT' | 'LOCAL' | 'COMMUNITY';

export interface Denomination {
  id: string;
  faceValue: number;
  sellingPrice: number;
  discountPercentage: number;
  stockRemaining: number;
}

export interface BrandVoucher {
  id: string;
  slug: string;
  brandName: string;
  category: 'Food & Dining' | 'Shopping' | 'Entertainment' | 'Travel' | 'Electronics';
  source: VoucherSource;
  logoUrl?: string;
  logoText?: string;
  bannerImage: string;
  accentColor: string;
  description: string;
  minOrderValue: number;
  isVerified: boolean;
  successRate: number; // e.g. 98%
  upvotes: number;
  downvotes: number;
  expiryDate: string;
  denominations: Denomination[];
}