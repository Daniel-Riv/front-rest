import { endpoints } from './endpoints';
import { http } from './http';
import type { ProductHistoryItem, ProductPayload, ProductRecord } from '@/types/product';

export const productApi = {
  async list(search?: string): Promise<ProductRecord[]> {
    const { data } = await http.get<ProductRecord[]>(endpoints.products.list, {
      params: search?.trim() ? { search: search.trim() } : undefined,
    });
    return data;
  },

  async create(payload: ProductPayload): Promise<ProductRecord> {
    const { data } = await http.post<ProductRecord>(endpoints.products.create, payload);
    return data;
  },

  async getById(id: number): Promise<ProductRecord> {
    const { data } = await http.get<ProductRecord>(endpoints.products.byId(id));
    return data;
  },

  async update(id: number, payload: Partial<ProductPayload>): Promise<ProductRecord> {
    const { data } = await http.put<ProductRecord>(endpoints.products.update(id), payload);
    return data;
  },

  async remove(id: number): Promise<{ id: number; deleted: boolean }> {
    const { data } = await http.delete<{ id: number; deleted: boolean }>(endpoints.products.delete(id));
    return data;
  },

  async getHistory(id: number): Promise<ProductHistoryItem[]> {
    const { data } = await http.get<ProductHistoryItem[]>(endpoints.products.history(id));
    return data;
  },
};
