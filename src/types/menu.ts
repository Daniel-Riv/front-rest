export type RoleSubmenu = {
  id: number;
  menuId: number;
  nameEs: string;
  nameEn: string;
  path: string;
  icon: string | null;
  sortOrder: number;
  status: number;
};

export type RoleMenu = {
  id: number;
  name: string;
  path: string;
  icon: string | null;
  parentId: number | null;
  sortOrder: number;
  status: number;
  submenus?: RoleSubmenu[];
};

export type MenusByRoleResponse = {
  roleId: number;
  menus: RoleMenu[];
};
