import { endpoints } from './endpoints';
import { http } from './http';
import type {
  CreateTablePayload,
  CreateZonePayload,
  TableRecord,
  TablesWorkspaceResponse,
  ZoneRecord,
} from '@/types/table';

export const tableApi = {
  async getWorkspace(): Promise<TablesWorkspaceResponse> {
    const { data } = await http.get<TablesWorkspaceResponse>(endpoints.tables.workspace);
    return data;
  },

  async createZone(payload: CreateZonePayload): Promise<ZoneRecord> {
    const { data } = await http.post<ZoneRecord>(endpoints.tables.createZone, payload);
    return data;
  },

  async createTable(payload: CreateTablePayload): Promise<TableRecord> {
    const { data } = await http.post<TableRecord>(endpoints.tables.createTable, payload);
    return data;
  },

  async updateTable(
    tableId: number,
    payload: Partial<CreateTablePayload> & { status?: number }
  ): Promise<TableRecord> {
    const { data } = await http.put<TableRecord>(endpoints.tables.updateTable(tableId), payload);
    return data;
  },

  async deleteTable(tableId: number): Promise<{ tableId: number; deleted: boolean }> {
    const { data } = await http.delete<{ tableId: number; deleted: boolean }>(
      endpoints.tables.deleteTable(tableId)
    );
    return data;
  },
};
