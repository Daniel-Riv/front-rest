import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AlertCircle, LayoutGrid, Minus, Plus } from 'lucide-react-native';
import { tableApi } from '@/services/tableApi';
import { getApiErrorMessage } from '@/services/http';
import type { TableRecord, ZoneRecord } from '@/types/table';

const C = {
  bgPage: '#1A1A1A',
  bgCard: '#252525',
  bgSurface: '#2A2A2A',
  bgInput: '#333333',
  accent: '#C05A3C',
  border: '#3A3A3A',
  textPrimary: '#F5F3EF',
  textSecondary: '#999999',
  textMuted: '#666666',
  greenBg: '#1A3D2A',
  greenText: '#6BCB77',
  greenBorder: '#4A7C59',
  orangeBg: '#3D2A1A',
  orangeText: '#F0A050',
  orangeBorder: '#D4A843',
  blueBg: '#1A2A3D',
  blueText: '#5CAAD4',
  blueBorder: '#5C7C8A',
  error: '#B54A4A',
};

const SHAPES = ['Cuadrada', 'Redonda', 'Rectangular'];

type Props = {
  primary: string;
  secondary: string;
  tertiary: string;
};

export default function VenderMesasWorkspace(_props: Props) {
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const [mesaNumber, setMesaNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedShape, setSelectedShape] = useState('Cuadrada');

  const initialized = useRef(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tableApi.getWorkspace();
      setZones(data.zones);
      setTables(data.tables);
      if (!initialized.current) {
        initialized.current = true;
        if (data.zones[0]) setSelectedZoneId(String(data.zones[0].id));
        const nums = data.tables
          .map((t) => Number.parseInt(t.name.replace(/\D/g, '')))
          .filter((n) => !Number.isNaN(n));
        setMesaNumber(String(nums.length > 0 ? Math.max(...nums) + 1 : 1));
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const nextSuggested = useMemo(() => {
    const nums = tables
      .map((t) => Number.parseInt(t.name.replace(/\D/g, '')))
      .filter((n) => !Number.isNaN(n));
    return nums.length > 0 ? Math.max(...nums) + 1 : 1;
  }, [tables]);

  const handleCreate = async () => {
    if (!mesaNumber.trim()) {
      setError('El número de mesa es obligatorio.');
      return;
    }
    if (!selectedZoneId) {
      setError('Debes seleccionar una zona.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const created = await tableApi.createTable({
        zoneId: Number(selectedZoneId),
        name: `Mesa ${mesaNumber.trim()}`,
        description: `Capacidad: ${capacity} personas · Forma: ${selectedShape}`,
      });
      setTables((prev) => [...prev, created]);
      setMesaNumber(String(Number.parseInt(mesaNumber) + 1));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setMesaNumber(String(nextSuggested));
    setCapacity(4);
    setSelectedShape('Cuadrada');
    setError(null);
  };

  const freeCount = tables.filter((t) => t.status === 1).length;

  const stats = [
    { label: 'Total Mesas', value: tables.length, bg: C.bgCard, border: C.border, valueColor: C.textPrimary },
    { label: 'Libres', value: freeCount, bg: C.greenBg, border: C.greenBorder, valueColor: C.greenText },
    { label: 'En Uso', value: 0, bg: C.blueBg, border: C.blueBorder, valueColor: C.blueText },
    { label: 'Pendiente', value: 0, bg: C.orangeBg, border: C.orangeBorder, valueColor: C.orangeText },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.formPanel}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formScroll}
        >
          <View style={styles.formTitleBlock}>
            <Text style={styles.formTitle}>Crear Nueva Mesa</Text>
            <Text style={styles.formSubtitle}>
              Completa los datos para agregar una mesa
            </Text>
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <AlertCircle size={13} color={C.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Número de Mesa</Text>
            <TextInput
              style={styles.input}
              value={mesaNumber}
              onChangeText={setMesaNumber}
              placeholder={String(nextSuggested)}
              placeholderTextColor={C.textMuted}
              keyboardType="numeric"
            />
            <Text style={styles.fieldHint}>
              Siguiente número disponible: {nextSuggested}
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Capacidad (personas)</Text>
            <View style={styles.counterRow}>
              <Pressable
                style={[styles.counterBtn, styles.counterBtnGhost]}
                onPress={() => setCapacity((c) => Math.max(1, c - 1))}
              >
                <Minus size={16} color={C.textPrimary} />
              </Pressable>
              <Text style={styles.counterValue}>{capacity}</Text>
              <Pressable
                style={[styles.counterBtn, styles.counterBtnAccent]}
                onPress={() => setCapacity((c) => c + 1)}
              >
                <Plus size={16} color={C.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* Zona */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Zona</Text>
            {loading ? (
              <ActivityIndicator color={C.accent} size="small" style={{ alignSelf: 'flex-start' }} />
            ) : (
              <View style={styles.chipRow}>
                {zones.map((zone) => {
                  const active = selectedZoneId === String(zone.id);
                  return (
                    <Pressable
                      key={zone.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setSelectedZoneId(String(zone.id))}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {zone.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Forma de Mesa</Text>
            <View style={styles.chipRow}>
              {SHAPES.map((shape) => {
                const active = selectedShape === shape;
                return (
                  <Pressable
                    key={shape}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setSelectedShape(shape)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {shape}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.formActions}>
          <Pressable style={styles.btnCancel} onPress={handleCancel}>
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btnCreate, saving && styles.btnDisabled]}
            onPress={handleCreate}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={C.textPrimary} />
            ) : (
              <>
                <Plus size={16} color={C.textPrimary} strokeWidth={2.5} />
                <Text style={styles.btnCreateText}>Crear Mesa</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.rightPanel}>
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: stat.bg, borderColor: stat.border }]}
            >
              <Text style={[styles.statValue, { color: stat.valueColor }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.gridHeader}>
          <Text style={styles.gridTitle}>MESAS EXISTENTES</Text>
          <Pressable style={styles.filterBtn}>
            <LayoutGrid size={13} color={C.textSecondary} />
            <Text style={styles.filterBtnText}>Todas las zonas</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={C.accent} size="large" />
          </View>
        ) : tables.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No hay mesas creadas aún.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.mesaGrid}>
            {tables.map((table) => {
              const available = table.status === 1;
              const cardBg = available ? C.bgSurface : C.orangeBg;
              const cardBorder = available ? C.border : C.orangeBorder;
              const numColor = available ? C.textPrimary : C.orangeText;
              const labelColor = available ? C.textMuted : C.orangeText;
              const rawNum = table.name.replace(/\D/g, '');
              const displayNum = rawNum ? rawNum.padStart(2, '0') : table.name.slice(0, 2);

              return (
                <Pressable
                  key={table.id}
                  style={[styles.mesaCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                >
                  <Text style={[styles.mesaNum, { color: numColor }]}>{displayNum}</Text>
                  <Text style={[styles.mesaLabel, { color: labelColor }]}>
                    {available ? 'Libre' : 'Inactiva'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.legend}>
          {[
            { bg: C.bgSurface, border: C.border, text: C.textMuted, label: 'Libre' },
            { bg: C.greenBg, border: C.greenBorder, text: C.greenText, label: 'En Uso' },
            { bg: C.orangeBg, border: C.orangeBorder, text: C.orangeText, label: 'Pendiente' },
          ].map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: l.bg, borderColor: l.border }]} />
              <Text style={[styles.legendText, { color: l.text }]}>{l.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.bgPage,
    //borderRadius: 12,
    overflow: 'hidden',
  },


  formPanel: {
    width: 420,
    backgroundColor: C.bgCard,
    borderRightWidth: 1,
    borderRightColor: C.border,
    flexDirection: 'column',
  },
  formScroll: {
    padding: 28,
    gap: 24,
    flexGrow: 1,
  },
  formTitleBlock: { gap: 4 },
  formTitle: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '700',
    color: C.textPrimary,
  },
  formSubtitle: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '400',
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#2A1A1A',
    borderWidth: 1,
    borderColor: C.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  errorText: { color: C.error, fontSize: 12, fontWeight: '600', flex: 1 },

  fieldGroup: { gap: 8 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSecondary,
  },
  fieldHint: { fontSize: 11, color: C.textMuted },
  input: {
    backgroundColor: C.bgInput,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textPrimary,
  },


  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnGhost: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bgSurface,
  },
  counterBtnAccent: { backgroundColor: C.accent },
  counterValue: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textPrimary,
    minWidth: 32,
    textAlign: 'center',
  },


  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: C.bgSurface,
  },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { fontSize: 13, fontWeight: '500', color: C.textSecondary },
  chipTextActive: { color: C.textPrimary, fontWeight: '600' },

  formActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  btnCancel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: C.bgSurface,
    borderWidth: 1,
    borderColor: C.border,
  },
  btnCancelText: { color: C.textSecondary, fontWeight: '600', fontSize: 14 },
  btnCreate: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: C.accent,
  },
  btnCreateText: { color: C.textPrimary, fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.5 },

  rightPanel: {
    flex: 1,
    padding: 28,
    gap: 24,
    flexDirection: 'column',
  },

  statsRow: { flexDirection: 'row', gap: 16 },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4,
  },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '500', color: C.textMuted },

  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textSecondary,
    letterSpacing: 1,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.bgInput,
  },
  filterBtnText: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: C.textMuted, fontSize: 14, fontWeight: '500' },
  mesaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mesaCard: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mesaNum: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '700',
  },
  mesaLabel: { fontSize: 10, fontWeight: '500' },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 2,
  },
  legendText: { fontSize: 12, fontWeight: '500' },
});
