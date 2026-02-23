/**
 * Endpoints del backend (centralizados).
 * Ajusta aquí cuando cambie el back.
 * La URL base viene de EXPO_PUBLIC_API_URL (ej: http://localhost:3000/api).
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  users: {
    me: '/users/me',
  },
  menus: {
    byRole: (roleId: number) => `/menus/role/${roleId}`,
  },
  businessInfo: {
    current: '/business-info/current',
    create: '/business-info',
    update: (id: number) => `/business-info/${id}`,
    history: (id: number) => `/business-info/${id}/history`,
  },
  tables: {
    workspace: '/tables/workspace',
    createZone: '/tables/zones',
    updateZone: (zoneId: number) => `/tables/zones/${zoneId}`,
    deleteZone: (zoneId: number) => `/tables/zones/${zoneId}`,
    createTable: '/tables',
    updateTable: (tableId: number) => `/tables/${tableId}`,
    deleteTable: (tableId: number) => `/tables/${tableId}`,
  },
  productCategories: {
    list: '/product-categories',
    create: '/product-categories',
    byId: (id: number) => `/product-categories/${id}`,
    update: (id: number) => `/product-categories/${id}`,
    delete: (id: number) => `/product-categories/${id}`,
    history: (id: number) => `/product-categories/${id}/history`,
  },
  productUnits: {
    list: '/product-units',
    create: '/product-units',
    byId: (id: number) => `/product-units/${id}`,
    update: (id: number) => `/product-units/${id}`,
    delete: (id: number) => `/product-units/${id}`,
    history: (id: number) => `/product-units/${id}/history`,
  },
  ingredients: {
    list: '/ingredients',
    create: '/ingredients',
    byId: (id: number) => `/ingredients/${id}`,
    update: (id: number) => `/ingredients/${id}`,
    delete: (id: number) => `/ingredients/${id}`,
    history: (id: number) => `/ingredients/${id}/history`,
  },
  suppliers: {
    list: '/suppliers',
    create: '/suppliers',
    byId: (id: number) => `/suppliers/${id}`,
    update: (id: number) => `/suppliers/${id}`,
    delete: (id: number) => `/suppliers/${id}`,
    history: (id: number) => `/suppliers/${id}/history`,
  },
  products: {
    list: '/products',
    create: '/products',
    byId: (id: number) => `/products/${id}`,
    update: (id: number) => `/products/${id}`,
    delete: (id: number) => `/products/${id}`,
    history: (id: number) => `/products/${id}/history`,
  },
} as const;

/**
 * URL completa del login (base + endpoint).
 * Usa la misma base que http.ts para consistencia.
 */
export function getLoginUrl(): string {
  const base =
    process.env.EXPO_PUBLIC_API_URL?.startsWith('http')
      ? process.env.EXPO_PUBLIC_API_URL
      : 'http://localhost:3000/api';
  return `${base.replace(/\/$/, '')}${endpoints.auth.login}`;
}
