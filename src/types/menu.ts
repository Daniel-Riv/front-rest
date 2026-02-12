export type RoleMenu = {
  id: number;
  name: string;
  path: string;
  icon: string | null;
  parentId: number | null;
  sortOrder: number;
  status: number;
};

export type MenusByRoleResponse = {
  roleId: number;
  menus: RoleMenu[];
};
