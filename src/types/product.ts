export type ProductVariantRecord = {
  id: number;
  name: string;
  additionalPrice: number;
  sortOrder: number;
  status: number;
};

export type ProductRecord = {
  id: number;
  productCategoryId: number | null;
  code: string | null;
  name: string;
  description: string | null;
  basePrice: number;
  status: number;
  category: {
    id: number;
    nameEs: string;
    nameEn: string | null;
  } | null;
  variants: ProductVariantRecord[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductVariantPayload = {
  name: string;
  additionalPrice?: number;
  sortOrder?: number;
};

export type ProductPayload = {
  productCategoryId?: number | null;
  code?: string | null;
  name: string;
  description?: string | null;
  basePrice?: number;
  status?: number;
  variants: ProductVariantPayload[];
};

export type ProductHistoryItem = {
  id: number;
  productId: number;
  changedByUserId: number | null;
  action: 'create' | 'update' | 'delete';
  changedFields: Record<string, unknown>;
  snapshot: Record<string, unknown>;
  createdAt: string;
};
