import { http } from './http';
import { endpoints } from './endpoints';
import type { MenusByRoleResponse } from '@/types/menu';

export const menuApi = {
  async getMenusByRole(roleId: number): Promise<MenusByRoleResponse> {
    const { data } = await http.get<MenusByRoleResponse>(endpoints.menus.byRole(roleId));
    return data;
  },
};
