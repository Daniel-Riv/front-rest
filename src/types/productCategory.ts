export type ProductCategoryRecord = {
  id: number;
  nameEs: string;
  nameEn: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductCategoryPayload = {
  nameEs: string;
  nameEn?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sortOrder?: number;
};

export type ProductCategoryHistoryItem = {
  id: number;
  productCategoryId: number;
  changedByUserId: number | null;
  action: 'create' | 'update' | 'delete';
  changedFields: Record<string, unknown>;
  snapshot: Record<string, unknown>;
  createdAt: string;
};
