export type ZoneRecord = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  sortOrder: number;
  status: number;
};

export type TableRecord = {
  id: number;
  zoneId: number;
  name: string;
  description: string | null;
  accessCode: string | null;
  isDeliveryOrCash: boolean;
  sortOrder: number;
  status: number;
};

export type TablesWorkspaceResponse = {
  zones: ZoneRecord[];
  tables: TableRecord[];
};

export type CreateZonePayload = {
  name: string;
  description?: string | null;
  color?: string;
  sortOrder?: number;
};

export type CreateTablePayload = {
  zoneId: number;
  name: string;
  description?: string | null;
  accessCode?: string | null;
  isDeliveryOrCash?: boolean;
  sortOrder?: number;
};
