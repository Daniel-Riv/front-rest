import { endpoints } from './endpoints';
import { http } from './http';
import type { ProductUnitHistoryItem, ProductUnitPayload, ProductUnitRecord } from '@/types/productUnit';

export const productUnitApi = {
  async list(): Promise<ProductUnitRecord[]> {
    const { data } = await http.get<ProductUnitRecord[]>(endpoints.productUnits.list);
    return data;
  },

  async create(payload: ProductUnitPayload): Promise<ProductUnitRecord> {
    const { data } = await http.post<ProductUnitRecord>(endpoints.productUnits.create, payload);
    return data;
  },

  async getById(id: number): Promise<ProductUnitRecord> {
    const { data } = await http.get<ProductUnitRecord>(endpoints.productUnits.byId(id));
    return data;
  },

  async update(id: number, payload: Partial<ProductUnitPayload>): Promise<ProductUnitRecord> {
    const { data } = await http.put<ProductUnitRecord>(endpoints.productUnits.update(id), payload);
    return data;
  },

  async remove(id: number): Promise<{ id: number; deleted: boolean }> {
    const { data } = await http.delete<{ id: number; deleted: boolean }>(endpoints.productUnits.delete(id));
    return data;
  },

  async getHistory(id: number): Promise<ProductUnitHistoryItem[]> {
    const { data } = await http.get<ProductUnitHistoryItem[]>(endpoints.productUnits.history(id));
    return data;
  },
};
