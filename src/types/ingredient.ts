export type IngredientCategoryRef = {
  id: number;
  nameEs: string;
  nameEn: string | null;
};

export type IngredientUnitRef = {
  id: number;
  name: string;
  shortName: string;
};

export type IngredientRecord = {
  id: number;
  productCategoryId: number;
  productUnitId: number;
  code: string | null;
  name: string;
  minStock: number;
  initialStock: number;
  currentStock: number;
  purchasePrice: number;
  status: number;
  category: IngredientCategoryRef | null;
  unit: IngredientUnitRef | null;
  createdAt?: string;
  updatedAt?: string;
};

export type IngredientPayload = {
  productCategoryId: number;
  productUnitId: number;
  code?: string | null;
  name: string;
  minStock?: number;
  initialStock?: number;
  currentStock?: number;
  purchasePrice?: number;
  status?: number;
};

export type IngredientHistoryItem = {
  id: number;
  ingredientId: number;
  changedByUserId: number | null;
  action: 'create' | 'update' | 'delete';
  changedFields: Record<string, unknown>;
  snapshot: Record<string, unknown>;
  createdAt: string;
};
