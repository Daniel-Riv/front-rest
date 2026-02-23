import { endpoints } from './endpoints';
import { http } from './http';
import type {
  ProductCategoryHistoryItem,
  ProductCategoryPayload,
  ProductCategoryRecord,
} from '@/types/productCategory';

export const productCategoryApi = {
  async list(): Promise<ProductCategoryRecord[]> {
    const { data } = await http.get<ProductCategoryRecord[]>(endpoints.productCategories.list);
    return data;
  },

  async create(payload: ProductCategoryPayload): Promise<ProductCategoryRecord> {
    const { data } = await http.post<ProductCategoryRecord>(endpoints.productCategories.create, payload);
    return data;
  },

  async getById(id: number): Promise<ProductCategoryRecord> {
    const { data } = await http.get<ProductCategoryRecord>(endpoints.productCategories.byId(id));
    return data;
  },

  async update(id: number, payload: Partial<ProductCategoryPayload>): Promise<ProductCategoryRecord> {
    const { data } = await http.put<ProductCategoryRecord>(endpoints.productCategories.update(id), payload);
    return data;
  },

  async remove(id: number): Promise<{ id: number; deleted: boolean }> {
    const { data } = await http.delete<{ id: number; deleted: boolean }>(endpoints.productCategories.delete(id));
    return data;
  },

  async getHistory(id: number): Promise<ProductCategoryHistoryItem[]> {
    const { data } = await http.get<ProductCategoryHistoryItem[]>(endpoints.productCategories.history(id));
    return data;
  },
};
