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
import { Feather } from '@expo/vector-icons';
import { productCategoryApi } from '@/services/productCategoryApi';
import { getApiErrorMessage } from '@/services/http';
import type {
  ProductCategoryHistoryItem,
  ProductCategoryPayload,
  ProductCategoryRecord,
} from '@/types/productCategory';
import EntityCard from '@/components/common/EntityCard';
import HistoryModal from '@/components/common/HistoryModal';

type Props = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type FormState = {
  nameEs: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: string;
};

const EMPTY_FORM: FormState = {
  nameEs: '',
  nameEn: '',
  description: '',
  icon: '',
  color: '',
  sortOrder: '0',
};

export default function ProductCategoriesWorkspace({ primary, secondary, tertiary }: Props) {
  const [rows, setRows] = useState<ProductCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState<ProductCategoryHistoryItem[]>([]);
  const [historyCategoryName, setHistoryCategoryName] = useState('');

  const orderedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.nameEs.localeCompare(b.nameEs);
      }),
    [rows]
  );

  const loadRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productCategoryApi.list();
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
      const category = await productCategoryApi.getById(id);
      setEditingId(category.id);
      setForm({
        nameEs: category.nameEs,
        nameEn: category.nameEn ?? '',
        description: category.description ?? '',
        icon: category.icon ?? '',
        color: category.color ?? '',
        sortOrder: String(category.sortOrder ?? 0),
      });
      setOpenForm(true);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const openCategoryHistory = async (row: ProductCategoryRecord) => {
    try {
      setOpenHistory(true);
      setHistoryLoading(true);
      setHistoryCategoryName(row.nameEs);
      setHistoryRows([]);
      const data = await productCategoryApi.getHistory(row.id);
      setHistoryRows(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setHistoryLoading(false);
    }
  };

  const buildPayload = (): ProductCategoryPayload => ({
    nameEs: form.nameEs.trim(),
    nameEn: form.nameEn.trim() || null,
    description: form.description.trim() || null,
    icon: form.icon.trim() || null,
    color: form.color.trim() || null,
    sortOrder: Number.isNaN(Number(form.sortOrder)) ? 0 : Number(form.sortOrder),
  });

  const save = async () => {
    if (!form.nameEs.trim()) {
      setError('El nombre en español es obligatorio.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = buildPayload();
      if (editingId) {
        const updated = await productCategoryApi.update(editingId, payload);
        setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSuccess('Categoría actualizada.');
      } else {
        const created = await productCategoryApi.create(payload);
        setRows((prev) => [...prev, created]);
        setSuccess('Categoría creada.');
      }
      setOpenForm(false);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = (row: ProductCategoryRecord) => {
    Alert.alert('Eliminar categoría', `¿Eliminar "${row.nameEs}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setError(null);
            await productCategoryApi.remove(row.id);
            setRows((prev) => prev.filter((item) => item.id !== row.id));
            setSuccess('Categoría eliminada.');
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
          <Text style={[styles.title, { color: secondary }]}>Categorías de Productos</Text>
          <Text style={styles.subtitle}>Administra categorías y su historial</Text>
        </View>
        <Pressable style={[styles.primaryBtn, { backgroundColor: primary }]} onPress={openCreate}>
          <Feather name="plus" size={14} color={tertiary} />
          <Text style={[styles.primaryBtnText, { color: tertiary }]}>Nueva categoría</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={15} color="#B91C1C" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {success ? (
        <View style={styles.successBox}>
          <Feather name="check-circle" size={15} color="#166534" />
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={primary} />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {orderedRows.map((row) => (
            <EntityCard
              key={row.id}
              title={row.nameEs}
              subtitle={row.nameEn || 'Sin nombre en inglés'}
              description={row.description || 'Sin descripción'}
              badge={
                <View style={[styles.iconBadge, { backgroundColor: row.color || '#E2E8F0' }]}>
                  <Feather name="tag" size={16} color="#0F172A" />
                </View>
              }
              metaItems={[`Orden: ${row.sortOrder}`, `Icono: ${row.icon || '-'}`]}
              actions={[
                { label: 'Editar', color: '#0369A1', onPress: () => openEdit(row.id) },
                { label: 'Historial', color: '#6D28D9', onPress: () => openCategoryHistory(row) },
                { label: 'Eliminar', color: '#B91C1C', onPress: () => remove(row) },
              ]}
            />
          ))}
        </ScrollView>
      )}

      <Modal visible={openForm} transparent animationType="fade" onRequestClose={() => setOpenForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Editar categoría' : 'Nueva categoría'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre ES *"
              value={form.nameEs}
              onChangeText={(value) => setForm((p) => ({ ...p, nameEs: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre EN"
              value={form.nameEn}
              onChangeText={(value) => setForm((p) => ({ ...p, nameEn: value }))}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción"
              value={form.description}
              multiline
              onChangeText={(value) => setForm((p) => ({ ...p, description: value }))}
            />
            <View style={styles.row2}>
              <TextInput
                style={[styles.input, styles.rowInput]}
                placeholder="Icono"
                value={form.icon}
                onChangeText={(value) => setForm((p) => ({ ...p, icon: value }))}
              />
              <TextInput
                style={[styles.input, styles.rowInput]}
                placeholder="Color HEX (#0EA5E9)"
                value={form.color}
                autoCapitalize="none"
                onChangeText={(value) => setForm((p) => ({ ...p, color: value }))}
              />
            </View>
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
        title={`Historial: ${historyCategoryName}`}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  errorText: { color: '#991B1B', fontWeight: '600', flex: 1, fontSize: 13 },
  successBox: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  successText: { color: '#166534', fontWeight: '600', flex: 1, fontSize: 13 },
  loadingWrap: { paddingVertical: 22, alignItems: 'center', gap: 8 },
  loadingText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  grid: { paddingTop: 12, gap: 10 },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  row2: { flexDirection: 'row', gap: 8 },
  rowInput: { flex: 1 },
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
