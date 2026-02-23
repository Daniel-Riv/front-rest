import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ingredientApi } from '@/services/ingredientApi';
import { productCategoryApi } from '@/services/productCategoryApi';
import { productUnitApi } from '@/services/productUnitApi';
import { getApiErrorMessage } from '@/services/http';
import type { IngredientHistoryItem, IngredientPayload, IngredientRecord } from '@/types/ingredient';
import type { ProductCategoryRecord } from '@/types/productCategory';
import type { ProductUnitRecord } from '@/types/productUnit';
import HistoryModal from '@/components/common/HistoryModal';

type Props = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type FormState = {
  productCategoryId: string;
  productUnitId: string;
  code: string;
  name: string;
  minStock: string;
  initialStock: string;
  purchasePrice: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  productCategoryId: '',
  productUnitId: '',
  code: '',
  name: '',
  minStock: '0',
  initialStock: '0',
  purchasePrice: '0',
  active: true,
};

export default function IngredientsWorkspace({ primary, secondary, tertiary }: Props) {
  const [rows, setRows] = useState<IngredientRecord[]>([]);
  const [categories, setCategories] = useState<ProductCategoryRecord[]>([]);
  const [units, setUnits] = useState<ProductUnitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openCategorySelect, setOpenCategorySelect] = useState(false);
  const [openUnitSelect, setOpenUnitSelect] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState<IngredientHistoryItem[]>([]);
  const [historyTitle, setHistoryTitle] = useState('');

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.name, row.code ?? '', row.category?.nameEs ?? '', row.unit?.shortName ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const selectedCategoryName = useMemo(() => {
    const found = categories.find((item) => String(item.id) === form.productCategoryId);
    return found?.nameEs ?? 'Seleccionar categoría';
  }, [categories, form.productCategoryId]);

  const selectedUnitName = useMemo(() => {
    const found = units.find((item) => String(item.id) === form.productUnitId);
    return found ? `${found.shortName} - ${found.name}` : 'Seleccionar unidad';
  }, [units, form.productUnitId]);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ingredients, catRows, unitRows] = await Promise.all([
        ingredientApi.list(),
        productCategoryApi.list(),
        productUnitApi.list(),
      ]);
      setRows(ingredients);
      setCategories(catRows);
      setUnits(unitRows);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      productCategoryId: categories[0] ? String(categories[0].id) : '',
      productUnitId: units[0] ? String(units[0].id) : '',
    });
    setOpenForm(true);
    setError(null);
  };

  const openEdit = async (id: number) => {
    try {
      setError(null);
      const item = await ingredientApi.getById(id);
      setEditingId(item.id);
      setForm({
        productCategoryId: String(item.productCategoryId),
        productUnitId: String(item.productUnitId),
        code: item.code ?? '',
        name: item.name,
        minStock: String(item.minStock),
        initialStock: String(item.initialStock),
        purchasePrice: String(item.purchasePrice),
        active: item.status === 1,
      });
      setOpenForm(true);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const openIngredientHistory = async (row: IngredientRecord) => {
    try {
      setOpenHistory(true);
      setHistoryLoading(true);
      setHistoryRows([]);
      setHistoryTitle(row.name);
      const data = await ingredientApi.getHistory(row.id);
      setHistoryRows(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setHistoryLoading(false);
    }
  };

  const buildPayload = (): IngredientPayload => ({
    productCategoryId: Number(form.productCategoryId),
    productUnitId: Number(form.productUnitId),
    code: form.code.trim() || null,
    name: form.name.trim(),
    minStock: Number(form.minStock || 0),
    initialStock: Number(form.initialStock || 0),
    purchasePrice: Number(form.purchasePrice || 0),
    status: form.active ? 1 : 0,
  });

  const save = async () => {
    if (!form.productCategoryId) {
      setError('Debes seleccionar una categoría.');
      return;
    }
    if (!form.productUnitId) {
      setError('Debes seleccionar una unidad.');
      return;
    }
    if (!form.name.trim()) {
      setError('El nombre del ingrediente es obligatorio.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = buildPayload();
      if (editingId) {
        const updated = await ingredientApi.update(editingId, payload);
        setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSuccess('Ingrediente actualizado.');
      } else {
        const created = await ingredientApi.create(payload);
        setRows((prev) => [created, ...prev]);
        setSuccess('Ingrediente creado.');
      }
      setOpenForm(false);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    try {
      setError(null);
      await ingredientApi.remove(id);
      setRows((prev) => prev.filter((item) => item.id !== id));
      setSuccess('Ingrediente eliminado.');
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: secondary }]}>Ingredientes</Text>
          <Text style={styles.subtitle}>Control de stock, compra y unidades</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={[styles.ghostBtn, { borderColor: primary }]} onPress={() => setSearch('')}>
            <Text style={[styles.ghostBtnText, { color: primary }]}>Limpiar filtro</Text>
          </Pressable>
          <Pressable style={[styles.primaryBtn, { backgroundColor: primary }]} onPress={openCreate}>
            <Text style={[styles.primaryBtnText, { color: tertiary }]}>Nuevo</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchRow}>
        <Text style={styles.searchLabel}>Buscar:</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="código, nombre, categoría..."
        />
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

      <View style={styles.tableHead}>
        <Text style={[styles.col, styles.colCat]}>Categoría</Text>
        <Text style={[styles.col, styles.colCode]}>Código</Text>
        <Text style={[styles.col, styles.colName]}>Nombre</Text>
        <Text style={[styles.col, styles.colNum]}>Precio compra</Text>
        <Text style={[styles.col, styles.colNum]}>Cantidad actual</Text>
        <Text style={[styles.col, styles.colNum]}>Stock mínimo</Text>
        <Text style={[styles.col, styles.colState]}>Estado</Text>
        <Text style={[styles.col, styles.colActions]}>Acciones</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={primary} />
          <Text style={styles.loadingText}>Cargando ingredientes...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.tableBody}>
          {filteredRows.map((row) => (
            <View key={row.id} style={styles.row}>
              <Text style={[styles.col, styles.colCat]}>{row.category?.nameEs ?? '-'}</Text>
              <Text style={[styles.col, styles.colCode]}>{row.code || '-'}</Text>
              <Text style={[styles.col, styles.colName]}>{row.name}</Text>
              <Text style={[styles.col, styles.colNum]}>{row.purchasePrice.toFixed(2)}</Text>
              <Text style={[styles.col, styles.colNum]}>{row.currentStock}</Text>
              <Text style={[styles.col, styles.colNum]}>{row.minStock}</Text>
              <Text style={[styles.col, styles.colState, row.status === 1 ? styles.stateOn : styles.stateOff]}>
                {row.status === 1 ? 'Activo' : 'Inactivo'}
              </Text>
              <View style={[styles.colActionsWrap, styles.colActions, styles.actionsRow]}>
                <Pressable onPress={() => openEdit(row.id)}>
                  <Text style={styles.actionEdit}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => openIngredientHistory(row)}>
                  <Text style={styles.actionHistory}>Historial</Text>
                </Pressable>
                <Pressable onPress={() => remove(row.id)}>
                  <Text style={styles.actionDelete}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={openForm} transparent animationType="fade" onRequestClose={() => setOpenForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ingrediente</Text>

            <Text style={styles.label}>Categoría*</Text>
            <Pressable style={styles.selectField} onPress={() => setOpenCategorySelect(true)}>
              <Text style={styles.selectText}>{selectedCategoryName}</Text>
              <Feather name="chevron-down" size={16} color="#64748B" />
            </Pressable>

            <Text style={styles.label}>Unidad*</Text>
            <Pressable style={styles.selectField} onPress={() => setOpenUnitSelect(true)}>
              <Text style={styles.selectText}>{selectedUnitName}</Text>
              <Feather name="chevron-down" size={16} color="#64748B" />
            </Pressable>

            <TextInput
              style={styles.input}
              placeholder="Código"
              value={form.code}
              onChangeText={(value) => setForm((prev) => ({ ...prev, code: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre*"
              value={form.name}
              onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
            />

            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Stock y compra</Text>
              <Text style={styles.fieldHint}>Stock mínimo</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={form.minStock}
                onChangeText={(value) => setForm((prev) => ({ ...prev, minStock: value }))}
              />
              <Text style={styles.fieldHint}>Stock inicial</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={form.initialStock}
                onChangeText={(value) => setForm((prev) => ({ ...prev, initialStock: value }))}
              />
              <Text style={styles.fieldHint}>Precio de compra</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={form.purchasePrice}
                onChangeText={(value) => setForm((prev) => ({ ...prev, purchasePrice: value }))}
              />
            </View>

            <View style={styles.switchRow}>
              <Switch value={form.active} onValueChange={(value) => setForm((prev) => ({ ...prev, active: value }))} />
              <Text style={styles.switchLabel}>Activo</Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setOpenForm(false)}>
                <Text style={styles.cancelBtnText}>Cerrar</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: primary }, saving && styles.disabled]}
                onPress={save}
                disabled={saving}
              >
                <Text style={[styles.primaryBtnText, { color: tertiary }]}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={openCategorySelect} transparent animationType="fade" onRequestClose={() => setOpenCategorySelect(false)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Selecciona una categoría</Text>
            <ScrollView contentContainerStyle={styles.pickerList}>
              {categories.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.pickerItem,
                    form.productCategoryId === String(item.id) && { borderColor: primary, backgroundColor: `${primary}14` },
                  ]}
                  onPress={() => {
                    setForm((prev) => ({ ...prev, productCategoryId: String(item.id) }));
                    setOpenCategorySelect(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item.nameEs}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.cancelBtn} onPress={() => setOpenCategorySelect(false)}>
              <Text style={styles.cancelBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={openUnitSelect} transparent animationType="fade" onRequestClose={() => setOpenUnitSelect(false)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Selecciona una unidad</Text>
            <ScrollView contentContainerStyle={styles.pickerList}>
              {units.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.pickerItem,
                    form.productUnitId === String(item.id) && { borderColor: primary, backgroundColor: `${primary}14` },
                  ]}
                  onPress={() => {
                    setForm((prev) => ({ ...prev, productUnitId: String(item.id) }));
                    setOpenUnitSelect(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>
                    {item.shortName} - {item.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.cancelBtn} onPress={() => setOpenUnitSelect(false)}>
              <Text style={styles.cancelBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <HistoryModal
        visible={openHistory}
        title={`Historial: ${historyTitle}`}
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
  headerActions: { flexDirection: 'row', gap: 8 },
  ghostBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  ghostBtnText: { fontWeight: '600', fontSize: 13 },
  primaryBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontWeight: '700', fontSize: 13 },
  searchRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchLabel: { color: '#334155', fontWeight: '600' },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    backgroundColor: '#FFFFFF',
  },
  errorBox: { marginTop: 10, borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, backgroundColor: '#FEF2F2', padding: 10 },
  errorText: { color: '#991B1B', fontWeight: '600', fontSize: 13 },
  successBox: { marginTop: 10, borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 10, backgroundColor: '#F0FDF4', padding: 10 },
  successText: { color: '#166534', fontWeight: '600', fontSize: 13 },
  tableHead: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableBody: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  col: { color: '#0F172A', fontSize: 12, fontWeight: '500' },
  colCat: { width: 130 },
  colCode: { width: 80 },
  colName: { width: 180 },
  colNum: { width: 95 },
  colState: { width: 70, fontWeight: '700' },
  colActions: { flex: 1 },
  colActionsWrap: { alignItems: 'flex-start', justifyContent: 'center' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  stateOn: { color: '#166534' },
  stateOff: { color: '#B91C1C' },
  actionEdit: { color: '#0369A1', fontWeight: '700', fontSize: 12 },
  actionHistory: { color: '#6D28D9', fontWeight: '700', fontSize: 12 },
  actionDelete: { color: '#B91C1C', fontWeight: '700', fontSize: 12 },
  loadingWrap: { marginTop: 24, alignItems: 'center', gap: 8 },
  loadingText: { color: '#64748B', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: { width: '100%', maxWidth: 640, borderRadius: 10, backgroundColor: '#FFFFFF', padding: 14 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  label: { marginTop: 2, marginBottom: 6, color: '#334155', fontWeight: '600', fontSize: 13 },
  selectField: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { color: '#334155', fontWeight: '600', fontSize: 13 },
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
  sectionBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  sectionTitle: { color: '#0F172A', fontWeight: '700', marginBottom: 8, fontSize: 14 },
  fieldHint: { color: '#475569', fontWeight: '600', fontSize: 12, marginBottom: 6 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  switchLabel: { color: '#334155', fontWeight: '600' },
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
  disabled: { opacity: 0.5 },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: 520,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 10,
  },
  pickerTitle: { color: '#0F172A', fontWeight: '700', fontSize: 16 },
  pickerList: { gap: 8 },
  pickerItem: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  pickerItemText: { color: '#334155', fontWeight: '600', fontSize: 13 },
});
