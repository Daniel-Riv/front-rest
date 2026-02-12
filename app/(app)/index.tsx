import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { menuApi } from '@/services/menuApi';
import { getApiErrorMessage } from '@/services/http';
import type { RoleMenu } from '@/types/menu';
import type { UserColors } from '@/types/auth';

type MenuGroup = {
  parent: RoleMenu;
  children: RoleMenu[];
};

const DEFAULT_COLORS: UserColors = {
  primary: '#0EA5E9',
  secondary: '#111827',
  tertiary: '#F8FAFC',
};

const HEX_REGEX = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;

function normalizeHexColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const normalized = value.trim();
  return HEX_REGEX.test(normalized) ? normalized : fallback;
}

function hexToRgba(hex: string, alpha: number): string {
  let raw = hex.replace('#', '');
  if (raw.length === 3) {
    raw = raw.split('').map((part) => part + part).join('');
  }

  const parsed = Number.parseInt(raw, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const [menus, setMenus] = useState<RoleMenu[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeParentId, setActiveParentId] = useState<number | null>(null);

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

  const menuGroups = useMemo<MenuGroup[]>(() => {
    if (menus.length === 0) return [];

    const ids = new Set(menus.map((item) => item.id));
    const parents = menus.filter((item) => item.parentId == null || !ids.has(item.parentId));

    if (parents.length === 0) {
      return menus.map((item) => ({ parent: item, children: [] }));
    }

    return parents.map((parent) => ({
      parent,
      children: menus.filter((item) => item.parentId === parent.id),
    }));
  }, [menus]);

  useEffect(() => {
    if (menuGroups.length === 0) {
      setActiveParentId(null);
      return;
    }
    if (!menuGroups.some((group) => group.parent.id === activeParentId)) {
      setActiveParentId(menuGroups[0]?.parent.id ?? null);
    }
  }, [menuGroups, activeParentId]);

  const iconForMenu = (menu: RoleMenu): keyof typeof Feather.glyphMap => {
    const text = `${menu.icon ?? ''} ${menu.name} ${menu.path}`.toLowerCase();
    if (text.includes('dash') || text.includes('inicio')) return 'grid';
    if (text.includes('venta')) return 'tag';
    if (text.includes('producto')) return 'shopping-bag';
    if (text.includes('domicilio') || text.includes('delivery')) return 'truck';
    if (text.includes('conta') || text.includes('finance')) return 'credit-card';
    if (text.includes('estad') || text.includes('report')) return 'bar-chart-2';
    if (text.includes('config') || text.includes('setting')) return 'settings';
    if (text.includes('usuario') || text.includes('user')) return 'user';
    return 'circle';
  };

  return (
    <View style={[styles.page, { backgroundColor: palette.secondary }]}>
      <View
        style={[
          styles.sidebar,
          sidebarCollapsed && styles.sidebarCollapsed,
          {
            backgroundColor: palette.secondary,
            borderRightColor: hexToRgba(palette.tertiary, 0.18),
          },
        ]}
      >
        <View style={styles.sidebarHeader}>
          <Pressable
            style={[
              styles.hamburgerBtn,
              {
                borderColor: hexToRgba(palette.tertiary, 0.25),
                backgroundColor: hexToRgba(palette.tertiary, 0.08),
              },
            ]}
            onPress={() => setSidebarCollapsed((v) => !v)}
          >
            <Feather name={sidebarCollapsed ? 'menu' : 'x'} size={18} color={palette.tertiary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.sidebarList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View
              style={[
                styles.stateBox,
                {
                  borderColor: hexToRgba(palette.tertiary, 0.2),
                  backgroundColor: hexToRgba(palette.tertiary, 0.08),
                },
              ]}
            >
              <ActivityIndicator color={palette.primary} />
              {!sidebarCollapsed ? (
                <Text style={[styles.stateText, { color: hexToRgba(palette.tertiary, 0.75) }]}>
                  {t('home.menuLoading')}
                </Text>
              ) : null}
            </View>
          ) : null}

          {!loading && error ? (
            <View
              style={[
                styles.stateBox,
                {
                  borderColor: hexToRgba(palette.primary, 0.45),
                  backgroundColor: hexToRgba(palette.primary, 0.12),
                },
              ]}
            >
              <Feather name="alert-triangle" size={16} color={palette.primary} />
              {!sidebarCollapsed ? (
                <Text style={[styles.errorText, { color: palette.primary }]}>{error}</Text>
              ) : null}
            </View>
          ) : null}

          {!loading && !error && menuGroups.length === 0 ? (
            <View
              style={[
                styles.stateBox,
                {
                  borderColor: hexToRgba(palette.tertiary, 0.2),
                  backgroundColor: hexToRgba(palette.tertiary, 0.08),
                },
              ]}
            >
              <Feather name="inbox" size={16} color={hexToRgba(palette.tertiary, 0.7)} />
              {!sidebarCollapsed ? (
                <Text style={[styles.stateText, { color: hexToRgba(palette.tertiary, 0.75) }]}>
                  {t('home.menuEmpty')}
                </Text>
              ) : null}
            </View>
          ) : null}

          {menuGroups.map((group) => {
            const isActive = group.parent.id === activeParentId;
            return (
              <Pressable
                key={group.parent.id}
                onPress={() => setActiveParentId(group.parent.id)}
                style={[
                  styles.navItem,
                  isActive && {
                    backgroundColor: hexToRgba(palette.primary, 0.18),
                    borderWidth: 1,
                    borderColor: hexToRgba(palette.primary, 0.45),
                  },
                ]}
              >
                <Feather
                  name={iconForMenu(group.parent)}
                  size={18}
                  color={isActive ? palette.primary : hexToRgba(palette.tertiary, 0.58)}
                />
                {!sidebarCollapsed ? (
                  <Text
                    style={[
                      styles.navLabel,
                      { color: hexToRgba(palette.tertiary, 0.72) },
                      isActive && { color: palette.tertiary },
                    ]}
                    numberOfLines={1}
                  >
                    {group.parent.name}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          style={[
            styles.logoutBtn,
            {
              borderColor: hexToRgba(palette.primary, 0.42),
              backgroundColor: hexToRgba(palette.primary, 0.14),
            },
          ]}
          onPress={logout}
        >
          <Feather name="log-out" size={16} color={palette.primary} />
          {!sidebarCollapsed ? (
            <Text style={[styles.logoutText, { color: palette.tertiary }]}>{t('home.logout')}</Text>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#090D17',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#1F2937',
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 14,
  },
  sidebarCollapsed: {
    width: 84,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  sidebarList: {
    gap: 6,
    paddingBottom: 14,
  },
  navItem: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLabel: {
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  logoutBtn: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 'auto',
  },
  logoutText: {
    fontWeight: '700',
  },
  stateBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stateText: {
    fontWeight: '600',
  },
  errorText: {
    fontWeight: '700',
    flex: 1,
  },
  emptySpace: {},
});
