import { endpoints } from './endpoints';
import { http } from './http';
import type { SupplierHistoryItem, SupplierPayload, SupplierRecord } from '@/types/supplier';

export const supplierApi = {
  async list(search?: string): Promise<SupplierRecord[]> {
    const { data } = await http.get<SupplierRecord[]>(endpoints.suppliers.list, {
      params: search?.trim() ? { search: search.trim() } : undefined,
    });
    return data;
  },

  async create(payload: SupplierPayload): Promise<SupplierRecord> {
    const { data } = await http.post<SupplierRecord>(endpoints.suppliers.create, payload);
    return data;
  },

  async getById(id: number): Promise<SupplierRecord> {
    const { data } = await http.get<SupplierRecord>(endpoints.suppliers.byId(id));
    return data;
  },

  async update(id: number, payload: Partial<SupplierPayload>): Promise<SupplierRecord> {
    const { data } = await http.put<SupplierRecord>(endpoints.suppliers.update(id), payload);
    return data;
  },

  async remove(id: number): Promise<{ id: number; deleted: boolean }> {
    const { data } = await http.delete<{ id: number; deleted: boolean }>(endpoints.suppliers.delete(id));
    return data;
  },

  async getHistory(id: number): Promise<SupplierHistoryItem[]> {
    const { data } = await http.get<SupplierHistoryItem[]>(endpoints.suppliers.history(id));
    return data;
  },
};
