import { endpoints } from './endpoints';
import { http } from './http';
import type { IngredientHistoryItem, IngredientPayload, IngredientRecord } from '@/types/ingredient';

export const ingredientApi = {
  async list(search?: string): Promise<IngredientRecord[]> {
    const { data } = await http.get<IngredientRecord[]>(endpoints.ingredients.list, {
      params: search?.trim() ? { search: search.trim() } : undefined,
    });
    return data;
  },

  async create(payload: IngredientPayload): Promise<IngredientRecord> {
    const { data } = await http.post<IngredientRecord>(endpoints.ingredients.create, payload);
    return data;
  },

  async getById(id: number): Promise<IngredientRecord> {
    const { data } = await http.get<IngredientRecord>(endpoints.ingredients.byId(id));
    return data;
  },

  async update(id: number, payload: Partial<IngredientPayload>): Promise<IngredientRecord> {
    const { data } = await http.put<IngredientRecord>(endpoints.ingredients.update(id), payload);
    return data;
  },

  async remove(id: number): Promise<{ id: number; deleted: boolean }> {
    const { data } = await http.delete<{ id: number; deleted: boolean }>(endpoints.ingredients.delete(id));
    return data;
  },

  async getHistory(id: number): Promise<IngredientHistoryItem[]> {
    const { data } = await http.get<IngredientHistoryItem[]>(endpoints.ingredients.history(id));
    return data;
  },
};
