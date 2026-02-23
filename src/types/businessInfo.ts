export type BusinessInfoRecord = {
  id: number;
  currentPlan: string | null;
  name: string;
  taxId: string;
  contact: string | null;
  email: string | null;
  address: string | null;
  country: string | null;
  department: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  handlesElectronicInvoicing: boolean;
  hasIngredientProducts: boolean;
  usesTables: boolean;
  hasDelivery: boolean;
  logoUrl: string | null;
  status: number;
  createdAt?: string;
  updatedAt?: string;
};

export type BusinessInfoPayload = {
  currentPlan?: string | null;
  name: string;
  taxId: string;
  contact?: string | null;
  email?: string | null;
  address?: string | null;
  country?: string | null;
  department?: string | null;
  city?: string | null;
  phone?: string | null;
  website?: string | null;
  handlesElectronicInvoicing?: boolean;
  hasIngredientProducts?: boolean;
  usesTables?: boolean;
  hasDelivery?: boolean;
  logoUrl?: string | null;
};

export type BusinessInfoHistoryItem = {
  id: number;
  businessInfoId: number;
  changedByUserId: number | null;
  action: 'create' | 'update';
  changedFields: Record<string, unknown>;
  snapshot: Record<string, unknown>;
  createdAt: string;
};
