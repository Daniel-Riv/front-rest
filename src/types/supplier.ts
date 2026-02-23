export type SupplierRecord = {
  id: number;
  name: string;
  commercialName: string | null;
  document: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  contact: string | null;
  note: string | null;
  status: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SupplierPayload = {
  name: string;
  commercialName?: string | null;
  document: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  contact?: string | null;
  note?: string | null;
  status?: number;
};

export type SupplierHistoryItem = {
  id: number;
  supplierId: number;
  changedByUserId: number | null;
  action: 'create' | 'update' | 'delete';
  changedFields: Record<string, unknown>;
  snapshot: Record<string, unknown>;
  createdAt: string;
};
