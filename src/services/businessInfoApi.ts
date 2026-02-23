import { endpoints } from './endpoints';
import { http } from './http';
import type {
  BusinessInfoHistoryItem,
  BusinessInfoPayload,
  BusinessInfoRecord,
} from '@/types/businessInfo';

export const businessInfoApi = {
  async getCurrent(): Promise<BusinessInfoRecord | null> {
    const { data } = await http.get<BusinessInfoRecord | null>(endpoints.businessInfo.current);
    return data;
  },

  async create(payload: BusinessInfoPayload): Promise<BusinessInfoRecord> {
    const { data } = await http.post<BusinessInfoRecord>(endpoints.businessInfo.create, payload);
    return data;
  },

  async update(id: number, payload: BusinessInfoPayload): Promise<BusinessInfoRecord> {
    const { data } = await http.put<BusinessInfoRecord>(endpoints.businessInfo.update(id), payload);
    return data;
  },

  async getHistory(id: number): Promise<BusinessInfoHistoryItem[]> {
    const { data } = await http.get<BusinessInfoHistoryItem[]>(endpoints.businessInfo.history(id));
    return data;
  },
};
