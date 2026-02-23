export type ProductUnitRecord = {
  id: number;
  name: string;
  shortName: string;
  description: string | null;
  sortOrder: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductUnitPayload = {
  name: string;
  shortName: string;
  description?: string | null;
  sortOrder?: number;
};

export type ProductUnitHistoryItem = {
  id: number;
  productUnitId: number;
  changedByUserId: number | null;
  action: 'create' | 'update' | 'delete';
  changedFields: Record<string, unknown>;
  snapshot: Record<string, unknown>;
  createdAt: string;
};
