import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { menuApi } from '@/services/menuApi';
import { getApiErrorMessage } from '@/services/http';
import type { RoleMenu, RoleSubmenu } from '@/types/menu';
import type { UserColors } from '@/types/auth';
import TablesWorkspace from '@/components/app/TablesWorkspace';
import BusinessInfoWorkspace from '@/components/app/BusinessInfoWorkspace';
import ProductCategoriesWorkspace from '@/components/app/ProductCategoriesWorkspace';
import ProductUnitsWorkspace from '@/components/app/ProductUnitsWorkspace';
import IngredientsWorkspace from '@/components/app/IngredientsWorkspace';
import SuppliersWorkspace from '@/components/app/SuppliersWorkspace';
import ProductsWorkspace from '@/components/app/ProductsWorkspace';

const DEFAULT_COLORS: UserColors = {
  primary: '#6366F1',
  secondary: '#0F172A',
  tertiary: '#F8FAFC',
};

const HEX_REGEX = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;

function normalizeHexColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const normalized = value.trim();
  return HEX_REGEX.test(normalized) ? normalized : fallback;
}

function normalizeRoutePath(path: string | undefined): string {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function hexToRgba(hex: string, alpha: number): string {
  let raw = hex.replace('#', '');
  if (raw.length === 3) raw = raw.split('').map((p) => p + p).join('');
  const parsed = Number.parseInt(raw, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function RoleMenuSidebarScreen() {
  const { t, locale } = useTranslation();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [menus, setMenus] = useState<RoleMenu[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredMenuId, setHoveredMenuId] = useState<number | null>(null);
  const [touchOpenMenuId, setTouchOpenMenuId] = useState<number | null>(null);

  const roleId = user?.roleIds?.[0];

  const palette = useMemo<UserColors>(() => {
    const source = user?.colors;
    return {
      primary: normalizeHexColor(source?.primary, DEFAULT_COLORS.primary),
      secondary: normalizeHexColor(source?.secondary, DEFAULT_COLORS.secondary),
      tertiary: normalizeHexColor(source?.tertiary, DEFAULT_COLORS.tertiary),
    };
  }, [user?.colors]);

  const fetchMenus = useCallback(async () => {
    if (!roleId) {
      setError(t('home.menuNoRole'));
      setMenus([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await menuApi.getMenusByRole(roleId);
      const sorted = [...response.menus].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      });
      setMenus(sorted);
    } catch (e) {
      setError(getApiErrorMessage(e) || t('home.menuError'));
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [roleId, t]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const activeMenuId = useMemo(() => {
    for (const menu of menus) {
      const menuPath = normalizeRoutePath(menu.path);
      const menuSelected = pathname === menuPath || pathname.startsWith(`${menuPath}/`);
      const subSelected = (menu.submenus ?? []).some((submenu) => {
        const subPath = normalizeRoutePath(submenu.path);
        return pathname === subPath || pathname.startsWith(`${subPath}/`);
      });
      if (menuSelected || subSelected) return menu.id;
    }
    return menus[0]?.id ?? null;
  }, [menus, pathname]);

  const isTablesRoute =
    pathname === '/configuracion/mesas' ||
    pathname.startsWith('/configuracion/mesas/') ||
    pathname === '/configuracion/crear-mesas' ||
    pathname.startsWith('/configuracion/crear-mesas/') ||
    pathname === '/vender/mesas' ||
    pathname.startsWith('/vender/mesas/');
  const isBusinessInfoRoute =
    pathname === '/configuracion/informacion-negocio' || pathname.startsWith('/configuracion/informacion-negocio/');
  const isProductCategoriesRoute =
    pathname === '/productos/categorias' ||
    pathname.startsWith('/productos/categorias/') ||
    pathname === '/productos/categoria' ||
    pathname.startsWith('/productos/categoria/') ||
    pathname === '/configuracion/categorias-productos' ||
    pathname.startsWith('/configuracion/categorias-productos/');
  const isProductUnitsRoute =
    pathname === '/productos/unidades' ||
    pathname.startsWith('/productos/unidades/') ||
    pathname === '/productos/unidades-medida' ||
    pathname.startsWith('/productos/unidades-medida/') ||
    pathname === '/configuracion/unidades-producto' ||
    pathname.startsWith('/configuracion/unidades-producto/');
  const isIngredientsRoute =
    pathname === '/productos/ingredientes' ||
    pathname.startsWith('/productos/ingredientes/') ||
    pathname === '/configuracion/ingredientes' ||
    pathname.startsWith('/configuracion/ingredientes/');
  const isSuppliersRoute =
    pathname === '/productos/proveedores' ||
    pathname.startsWith('/productos/proveedores/') ||
    pathname === '/configuracion/proveedores' ||
    pathname.startsWith('/configuracion/proveedores/');
  const isProductsRoute =
    pathname === '/productos' ||
    pathname.startsWith('/productos/') ||
    pathname === '/configuracion/productos' ||
    pathname.startsWith('/configuracion/productos/');
  const displayedOpenMenuId = hoveredMenuId ?? touchOpenMenuId;

  const getSubmenuLabel = (submenu: RoleSubmenu) => (locale === 'es' ? submenu.nameEs : submenu.nameEn);

  const navigateTo = (path: string | undefined) => {
    const target = normalizeRoutePath(path);
    if (pathname === target) return;
    setHoveredMenuId(null);
    setTouchOpenMenuId(null);
    router.replace(target as never);
  };

  const iconForMenu = (input: { icon: string | null; name: string; path: string }): keyof typeof Feather.glyphMap => {
    const text = `${input.icon ?? ''} ${input.name} ${input.path}`.toLowerCase();
    if (text.includes('inicio') || text.includes('dash')) return 'home';
    if (text.includes('producto')) return 'shopping-cart';
    if (text.includes('servicio')) return 'briefcase';
    if (text.includes('estad') || text.includes('analytic')) return 'bar-chart-2';
    if (text.includes('recurso')) return 'file-text';
    if (text.includes('contact')) return 'mail';
    if (text.includes('config')) return 'settings';
    return 'grid';
  };

  return (
    <View style={[styles.page, { backgroundColor: hexToRgba(palette.secondary, 0.05) }]}>
      {displayedOpenMenuId != null ? (
        <Pressable
          style={styles.overlayClose}
          onPress={() => {
            setHoveredMenuId(null);
            setTouchOpenMenuId(null);
          }}
        />
      ) : null}
      <View style={[styles.navWrap, { paddingTop: insets.top + 10 }]}>
        <View style={styles.navInner}>
          <View style={styles.brandWrap}>
            <View style={[styles.brandIcon, { backgroundColor: palette.primary }]}>
              <Text style={[styles.brandIconText, { color: palette.tertiary }]}>M</Text>
            </View>
            <Text style={[styles.brandText, { color: palette.secondary }]}>MiApp</Text>
          </View>

          <View style={styles.menuLine}>
            {menus.map((menu) => {
              const selected = menu.id === activeMenuId;
              const hasSubmenus = (menu.submenus?.length ?? 0) > 0;
              const opened = displayedOpenMenuId === menu.id && hasSubmenus;

              return (
                <Pressable
                  key={menu.id}
                  style={styles.menuItemWrap}
                  onHoverIn={() => {
                    if (hasSubmenus) {
                      setHoveredMenuId(menu.id);
                    }
                  }}
                >
                  <Pressable
                    style={[
                      styles.menuItem,
                      selected && {
                        backgroundColor: hexToRgba(palette.primary, 0.12),
                        borderColor: hexToRgba(palette.primary, 0.38),
                      },
                    ]}
                    onPress={() => {
                      if (hasSubmenus) {
                        setTouchOpenMenuId((prev) => (prev === menu.id ? null : menu.id));
                      }
                      navigateTo(menu.path);
                    }}
                  >
                    <Feather
                      name={iconForMenu(menu)}
                      size={18}
                      color={selected ? palette.primary : hexToRgba(palette.secondary, 0.72)}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        { color: hexToRgba(palette.secondary, 0.78) },
                        selected && { color: palette.primary },
                      ]}
                    >
                      {menu.name}
                    </Text>
                    {hasSubmenus ? (
                      <Feather
                        name={opened ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={selected ? palette.primary : hexToRgba(palette.secondary, 0.62)}
                      />
                    ) : null}
                  </Pressable>

                  {opened ? (
                    <View style={styles.dropdownCard}>
                      {(menu.submenus ?? []).map((submenu) => {
                        const submenuPath = normalizeRoutePath(submenu.path);
                        const submenuActive = pathname === submenuPath || pathname.startsWith(`${submenuPath}/`);
                        return (
                          <Pressable
                            key={submenu.id}
                            style={[
                              styles.dropdownItem,
                              submenuActive && { backgroundColor: hexToRgba(palette.primary, 0.1) },
                            ]}
                            onPress={() => navigateTo(submenu.path)}
                          >
                            <Text
                              style={[
                                styles.dropdownTitle,
                                { color: palette.secondary },
                                submenuActive && { color: palette.primary },
                              ]}
                            >
                              {getSubmenuLabel(submenu)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.rightIcons}>
            <Pressable style={styles.iconBtn}>
              <Feather name="users" size={18} color={hexToRgba(palette.secondary, 0.75)} />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Feather name="calendar" size={18} color={hexToRgba(palette.secondary, 0.75)} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={logout}>
              <Feather name="log-out" size={18} color={hexToRgba(palette.secondary, 0.75)} />
            </Pressable>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loadingText}>{t('home.menuLoading')}</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={[styles.errorWrap, { borderColor: hexToRgba(palette.primary, 0.35) }]}>
          <Feather name="alert-circle" size={16} color={palette.primary} />
          <Text style={[styles.errorText, { color: palette.primary }]}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.contentWrap}>
        {isTablesRoute ? (
          <TablesWorkspace primary={palette.primary} secondary={palette.secondary} tertiary={palette.tertiary} />
        ) : isBusinessInfoRoute ? (
          <BusinessInfoWorkspace primary={palette.primary} secondary={palette.secondary} tertiary={palette.tertiary} />
        ) : isProductCategoriesRoute ? (
          <ProductCategoriesWorkspace
            primary={palette.primary}
            secondary={palette.secondary}
            tertiary={palette.tertiary}
          />
        ) : isProductUnitsRoute ? (
          <ProductUnitsWorkspace primary={palette.primary} secondary={palette.secondary} tertiary={palette.tertiary} />
        ) : isIngredientsRoute ? (
          <IngredientsWorkspace primary={palette.primary} secondary={palette.secondary} tertiary={palette.tertiary} />
        ) : isSuppliersRoute ? (
          <SuppliersWorkspace primary={palette.primary} secondary={palette.secondary} tertiary={palette.tertiary} />
        ) : isProductsRoute ? (
          <ProductsWorkspace primary={palette.primary} secondary={palette.secondary} tertiary={palette.tertiary} />
        ) : (
          <View style={styles.heroCard}>
            <Text style={[styles.heroTitle, { color: palette.secondary }]}>Bienvenido a tu panel</Text>
            <Text style={styles.heroSubtitle}>
              Pasa el mouse por cada módulo para ver sus submenús.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  overlayClose: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 15,
  },
  navWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    zIndex: 20,
  },
  navInner: {
    minHeight: 64,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brandIconText: { fontSize: 18, fontWeight: '800' },
  brandText: { fontSize: 22, fontWeight: '700' },
  menuLine: {
    flex: 1,
    paddingHorizontal: 8,
    gap: 6,
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuItemWrap: {
    position: 'relative',
    zIndex: 50,
  },
  menuItem: {
    minHeight: 42,
    borderRadius: 11,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
  },
  menuItemText: { fontSize: 14, fontWeight: '600' },
  rightIcons: { marginLeft: 'auto', flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownCard: {
    position: 'absolute',
    top: 48,
    left: 0,
    width: 340,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownTitle: { fontSize: 14, fontWeight: '600' },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  loadingText: { color: '#64748B', fontWeight: '600' },
  errorWrap: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  errorText: { fontWeight: '700', flex: 1 },
  contentWrap: { flex: 1, padding: 16 },
  heroCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 18,
  },
  heroTitle: { fontSize: 28, fontWeight: '700' },
  heroSubtitle: { marginTop: 8, color: '#475569', fontSize: 15, fontWeight: '500' },
});
