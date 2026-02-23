import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { productUnitApi } from '@/services/productUnitApi';
import { getApiErrorMessage } from '@/services/http';
import type { ProductUnitHistoryItem, ProductUnitPayload, ProductUnitRecord } from '@/types/productUnit';
import EntityCard from '@/components/common/EntityCard';
import HistoryModal from '@/components/common/HistoryModal';

type Props = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type FormState = {
  name: string;
  shortName: string;
  description: string;
  sortOrder: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  shortName: '',
  description: '',
  sortOrder: '0',
};

export default function ProductUnitsWorkspace({ primary, secondary, tertiary }: Props) {
  const [rows, setRows] = useState<ProductUnitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState<ProductUnitHistoryItem[]>([]);
  const [historyUnitName, setHistoryUnitName] = useState('');

  const orderedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      }),
    [rows]
  );

  const loadRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productUnitApi.list();
      setRows(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSuccess(null);
    setError(null);
    setOpenForm(true);
  };

  const openEdit = async (id: number) => {
    try {
      setError(null);
      const unit = await productUnitApi.getById(id);
      setEditingId(unit.id);
      setForm({
        name: unit.name,
        shortName: unit.shortName,
        description: unit.description ?? '',
        sortOrder: String(unit.sortOrder ?? 0),
      });
      setOpenForm(true);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const openUnitHistory = async (row: ProductUnitRecord) => {
    try {
      setOpenHistory(true);
      setHistoryLoading(true);
      setHistoryUnitName(row.name);
      setHistoryRows([]);
      const data = await productUnitApi.getHistory(row.id);
      setHistoryRows(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setHistoryLoading(false);
    }
  };

  const buildPayload = (): ProductUnitPayload => ({
    name: form.name.trim(),
    shortName: form.shortName.trim(),
    description: form.description.trim() || null,
    sortOrder: Number.isNaN(Number(form.sortOrder)) ? 0 : Number(form.sortOrder),
  });

  const save = async () => {
    if (!form.name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!form.shortName.trim()) {
      setError('La abreviatura es obligatoria.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = buildPayload();
      if (editingId) {
        const updated = await productUnitApi.update(editingId, payload);
        setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSuccess('Unidad actualizada.');
      } else {
        const created = await productUnitApi.create(payload);
        setRows((prev) => [...prev, created]);
        setSuccess('Unidad creada.');
      }
      setOpenForm(false);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = (row: ProductUnitRecord) => {
    Alert.alert('Eliminar unidad', `¿Eliminar "${row.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setError(null);
            await productUnitApi.remove(row.id);
            setRows((prev) => prev.filter((item) => item.id !== row.id));
            setSuccess('Unidad eliminada.');
          } catch (e) {
            setError(getApiErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: secondary }]}>Unidades de Producto</Text>
          <Text style={styles.subtitle}>Ejemplo: kg, gr, und, lt</Text>
        </View>
        <Pressable style={[styles.primaryBtn, { backgroundColor: primary }]} onPress={openCreate}>
          <Text style={[styles.primaryBtnText, { color: tertiary }]}>Nueva unidad</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={primary} />
          <Text style={styles.loadingText}>Cargando unidades...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {orderedRows.map((row) => (
            <EntityCard
              key={row.id}
              title={row.name}
              subtitle={`Abreviatura: ${row.shortName}`}
              description={row.description || 'Sin descripción'}
              badge={
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{row.shortName.toUpperCase()}</Text>
                </View>
              }
              metaItems={[`Orden: ${row.sortOrder}`]}
              actions={[
                { label: 'Editar', color: '#0369A1', onPress: () => openEdit(row.id) },
                { label: 'Historial', color: '#6D28D9', onPress: () => openUnitHistory(row) },
                { label: 'Eliminar', color: '#B91C1C', onPress: () => remove(row) },
              ]}
            />
          ))}
        </ScrollView>
      )}

      <Modal visible={openForm} transparent animationType="fade" onRequestClose={() => setOpenForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Editar unidad' : 'Nueva unidad'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre *"
              value={form.name}
              onChangeText={(value) => setForm((p) => ({ ...p, name: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Abreviatura * (kg, gr, und)"
              value={form.shortName}
              onChangeText={(value) => setForm((p) => ({ ...p, shortName: value }))}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción"
              value={form.description}
              multiline
              onChangeText={(value) => setForm((p) => ({ ...p, description: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Orden"
              keyboardType="numeric"
              value={form.sortOrder}
              onChangeText={(value) => setForm((p) => ({ ...p, sortOrder: value }))}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setOpenForm(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, saving && styles.disabledBtn, { backgroundColor: primary }]}
                onPress={save}
                disabled={saving}
              >
                <Text style={[styles.primaryBtnText, { color: tertiary }]}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <HistoryModal
        visible={openHistory}
        title={`Historial: ${historyUnitName}`}
        loading={historyLoading}
        rows={historyRows}
        onClose={() => setOpenHistory(false)}
        accentColor={primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#64748B', marginTop: 4, fontWeight: '500', fontSize: 13 },
  primaryBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryBtnText: { fontWeight: '700', fontSize: 13 },
  errorBox: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  errorText: { color: '#991B1B', fontWeight: '600', fontSize: 13 },
  successBox: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
  },
  successText: { color: '#166534', fontWeight: '600', fontSize: 13 },
  loadingWrap: { paddingVertical: 22, alignItems: 'center', gap: 8 },
  loadingText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  grid: { paddingTop: 12, gap: 10 },
  badge: {
    width: 48,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  badgeText: { fontWeight: '800', color: '#0F172A' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: { width: '100%', maxWidth: 640, borderRadius: 10, backgroundColor: '#FFFFFF', padding: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  textArea: { minHeight: 78, textAlignVertical: 'top' },
  modalActions: { marginTop: 6, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: { color: '#334155', fontWeight: '600' },
  disabledBtn: { opacity: 0.5 },
});
