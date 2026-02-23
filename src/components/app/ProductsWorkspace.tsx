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
import { productApi } from '@/services/productApi';
import { productCategoryApi } from '@/services/productCategoryApi';
import { getApiErrorMessage } from '@/services/http';
import type { ProductHistoryItem, ProductPayload, ProductRecord } from '@/types/product';
import type { ProductCategoryRecord } from '@/types/productCategory';
import HistoryModal from '@/components/common/HistoryModal';

type Props = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type VariantForm = {
  name: string;
  additionalPrice: string;
};

type FormState = {
  productCategoryId: string;
  productType: 'normal' | 'servicio';
  code: string;
  name: string;
  description: string;
  basePrice: string;
  active: boolean;
  inventoryEnabled: boolean;
  variants: VariantForm[];
};

type ProductTab =
  | 'datos'
  | 'impuestos'
  | 'variante'
  | 'inventario'
  | 'adicionales'
  | 'precio'
  | 'avanzado'
  | 'integraciones';

const PRODUCT_TABS: Array<{ key: ProductTab; label: string; icon: keyof typeof Feather.glyphMap; badge?: string }> = [
  { key: 'datos', label: 'Datos', icon: 'list' },
  { key: 'impuestos', label: 'Impuestos', icon: 'credit-card', badge: 'Nuevo' },
  { key: 'variante', label: 'Variante', icon: 'shuffle' },
  { key: 'inventario', label: 'Inventario', icon: 'archive' },
  { key: 'adicionales', label: 'Adicionales', icon: 'plus-square' },
  { key: 'precio', label: 'Variante de precios', icon: 'dollar-sign' },
  { key: 'avanzado', label: 'Avanzado', icon: 'settings' },
  { key: 'integraciones', label: 'Integraciones', icon: 'package' },
];

const AVAILABLE_TAXES = ['INC - 8%', 'IVA - 19%'];

const EMPTY_FORM: FormState = {
  productCategoryId: '',
  productType: 'normal',
  code: '',
  name: '',
  description: '',
  basePrice: '0',
  active: true,
  inventoryEnabled: true,
  variants: [{ name: '', additionalPrice: '0' }],
};

export default function ProductsWorkspace({ primary, secondary, tertiary }: Props) {
  const [rows, setRows] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<ProductCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openCategorySelect, setOpenCategorySelect] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductTab>('datos');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState<ProductHistoryItem[]>([]);
  const [historyTitle, setHistoryTitle] = useState('');
  const [openTaxSelect, setOpenTaxSelect] = useState(false);
  const [selectedTaxOption, setSelectedTaxOption] = useState(AVAILABLE_TAXES[0] ?? '');
  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.name, row.code ?? '', row.category?.nameEs ?? '', row.variants.map((v) => v.name).join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const selectedCategoryName = useMemo(() => {
    const found = categories.find((item) => String(item.id) === form.productCategoryId);
    return found?.nameEs ?? 'Seleccione';
  }, [categories, form.productCategoryId]);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [products, catRows] = await Promise.all([productApi.list(), productCategoryApi.list()]);
      setRows(products);
      setCategories(catRows);
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
    setActiveTab('datos');
    setSelectedTaxes([]);
    setSelectedTaxOption(AVAILABLE_TAXES[0] ?? '');
    setForm({
      ...EMPTY_FORM,
      productCategoryId: categories[0] ? String(categories[0].id) : '',
    });
    setOpenForm(true);
    setError(null);
  };

  const openEdit = async (id: number) => {
    try {
      setError(null);
      setActiveTab('datos');
      const item = await productApi.getById(id);
      setEditingId(item.id);
      setForm({
        productCategoryId: item.productCategoryId == null ? '' : String(item.productCategoryId),
        productType: 'normal',
        code: item.code ?? '',
        name: item.name,
        description: item.description ?? '',
        basePrice: String(item.basePrice),
        active: item.status === 1,
        inventoryEnabled: true,
        variants: item.variants.length
          ? item.variants.map((v) => ({ name: v.name, additionalPrice: String(v.additionalPrice) }))
          : [{ name: '', additionalPrice: '0' }],
      });
      setSelectedTaxes([]);
      setOpenForm(true);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const openProductHistory = async (row: ProductRecord) => {
    try {
      setOpenHistory(true);
      setHistoryLoading(true);
      setHistoryRows([]);
      setHistoryTitle(row.name);
      const data = await productApi.getHistory(row.id);
      setHistoryRows(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setHistoryLoading(false);
    }
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: '', additionalPrice: '0' }],
    }));
  };

  const removeVariant = (index: number) => {
    setForm((prev) => {
      const next = prev.variants.filter((_, idx) => idx !== index);
      return { ...prev, variants: next.length ? next : [{ name: '', additionalPrice: '0' }] };
    });
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addSelectedTax = () => {
    if (!selectedTaxOption) return;
    setSelectedTaxes((prev) => (prev.includes(selectedTaxOption) ? prev : [...prev, selectedTaxOption]));
  };

  const removeSelectedTax = (taxName: string) => {
    setSelectedTaxes((prev) => prev.filter((item) => item !== taxName));
  };

  const buildPayload = (): ProductPayload => ({
    productCategoryId: form.productCategoryId ? Number(form.productCategoryId) : null,
    code: form.code.trim() || null,
    name: form.name.trim(),
    description: form.description.trim() || null,
    basePrice: Number(form.basePrice || 0),
    status: form.active ? 1 : 0,
    variants: form.variants
      .filter((item) => item.name.trim().length > 0)
      .map((item, index) => ({
        name: item.name.trim(),
        additionalPrice: Number(item.additionalPrice || 0),
        sortOrder: index,
      })),
  });

  const save = async () => {
    if (!form.name.trim()) {
      setError('El nombre del producto es obligatorio.');
      setActiveTab('datos');
      return;
    }
    if (!form.variants.some((item) => item.name.trim())) {
      setError('Debes agregar al menos un subproducto/variante.');
      setActiveTab('variante');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = buildPayload();
      if (editingId) {
        const updated = await productApi.update(editingId, payload);
        setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSuccess('Producto actualizado.');
      } else {
        const created = await productApi.create(payload);
        setRows((prev) => [created, ...prev]);
        setSuccess('Producto creado.');
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
      await productApi.remove(id);
      setRows((prev) => prev.filter((item) => item.id !== id));
      setSuccess('Producto eliminado.');
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'datos') {
      return (
        <View style={styles.tabBody}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarCircle, { backgroundColor: primary }]}>
              <Text style={[styles.avatarLetter, { color: tertiary }]}>{form.name.trim().charAt(0).toUpperCase() || 'P'}</Text>
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Tipo*</Text>
              <Pressable
                style={styles.selectField}
                onPress={() =>
                  setForm((prev) => ({ ...prev, productType: prev.productType === 'normal' ? 'servicio' : 'normal' }))
                }
              >
                <Text style={styles.selectText}>{form.productType === 'normal' ? 'Normal' : 'Servicio'}</Text>
                <Feather name="chevron-down" size={16} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Categoría*</Text>
              <Pressable style={styles.selectField} onPress={() => setOpenCategorySelect(true)}>
                <Text style={styles.selectText}>{selectedCategoryName}</Text>
                <Feather name="chevron-down" size={16} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Nombre*</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={3}
                value={form.description}
                onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Código</Text>
              <TextInput
                style={styles.input}
                value={form.code}
                onChangeText={(v) => setForm((p) => ({ ...p, code: v }))}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Precio de venta</Text>
              <TextInput
                style={styles.input}
                value={form.basePrice}
                keyboardType="numeric"
                onChangeText={(v) => setForm((p) => ({ ...p, basePrice: v }))}
              />
            </View>
          </View>

          <View style={styles.switchArea}>
            <View style={styles.switchRow}>
              <Switch
                value={form.inventoryEnabled}
                onValueChange={(value) => setForm((prev) => ({ ...prev, inventoryEnabled: value }))}
              />
              <Text style={styles.switchLabel}>Inventariable</Text>
            </View>
            <View style={styles.switchRow}>
              <Switch value={form.active} onValueChange={(value) => setForm((prev) => ({ ...prev, active: value }))} />
              <Text style={styles.switchLabel}>Activo</Text>
            </View>
          </View>
        </View>
      );
    }

    if (activeTab === 'impuestos') {
      return (
        <View style={styles.tabBody}>
          <Text style={styles.centerTitle}>Impuestos</Text>
          <View style={styles.taxRow}>
            <View style={styles.taxSelectWrap}>
              <Text style={styles.label}>Impuesto</Text>
              <Pressable style={styles.selectField} onPress={() => setOpenTaxSelect(true)}>
                <Text style={styles.selectText}>{selectedTaxOption}</Text>
                <Feather name="chevron-down" size={16} color="#64748B" />
              </Pressable>
            </View>
            <View style={styles.taxAddWrap}>
              <Text style={styles.label}>Agregar</Text>
              <Pressable style={[styles.squareBtn, { backgroundColor: primary }]} onPress={addSelectedTax}>
                <Feather name="plus" size={20} color={tertiary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.taxListWrap}>
            {selectedTaxes.length === 0 ? (
              <Text style={styles.emptyTabText}>No tiene impuestos relacionados.</Text>
            ) : (
              selectedTaxes.map((tax) => (
                <View key={tax} style={styles.taxItem}>
                  <Text style={styles.taxName}>{tax}</Text>
                  <Pressable onPress={() => removeSelectedTax(tax)}>
                    <Feather name="x" size={16} color="#B91C1C" />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      );
    }

    if (activeTab === 'variante') {
      return (
        <View style={styles.tabBody}>
          <Text style={[styles.centerTitle, { color: '#2563EB' }]}>¿Que es esto?</Text>
          <View style={styles.variantTopRow}>
            <View style={[styles.fieldWrap, styles.variantShort]}>
              <Text style={styles.label}>Nombre Corto</Text>
              <TextInput style={styles.input} placeholder="Ej: 1/4, Medio, Litro, Talla 30" />
            </View>
            <View style={[styles.fieldWrap, styles.variantPriceWrap]}>
              <Text style={styles.label}>Precio</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={styles.taxAddWrap}>
              <Text style={styles.label}>Agregar</Text>
              <Pressable style={[styles.squareBtn, { backgroundColor: primary }]} onPress={addVariant}>
                <Feather name="plus" size={20} color={tertiary} />
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.variantList}>
            {form.variants.map((variant, index) => (
              <View key={`${index}-${variant.name}`} style={styles.variantRow}>
                <TextInput
                  style={[styles.input, styles.variantName]}
                  placeholder="Subproducto / variante"
                  value={variant.name}
                  onChangeText={(value) => updateVariant(index, 'name', value)}
                />
                <TextInput
                  style={[styles.input, styles.variantPrice]}
                  placeholder="Precio adicional"
                  keyboardType="numeric"
                  value={variant.additionalPrice}
                  onChangeText={(value) => updateVariant(index, 'additionalPrice', value)}
                />
                <Pressable style={styles.removeVariantBtn} onPress={() => removeVariant(index)}>
                  <Feather name="x" size={16} color="#B91C1C" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={[styles.tabBody, styles.comingSoonWrap]}>
        <Feather name="clock" size={20} color="#64748B" />
        <Text style={styles.emptyTabText}>Este módulo se activa en la siguiente fase.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: secondary }]}>Productos</Text>
          <Text style={styles.subtitle}>Catálogo de productos y subproductos</Text>
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
          placeholder="nombre, código, categoría..."
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
        <Text style={[styles.col, styles.colName]}>Producto</Text>
        <Text style={[styles.col, styles.colCat]}>Categoría</Text>
        <Text style={[styles.col, styles.colCode]}>Código</Text>
        <Text style={[styles.col, styles.colNum]}>Precio base</Text>
        <Text style={[styles.col, styles.colVariants]}>Subproductos</Text>
        <Text style={[styles.col, styles.colState]}>Estado</Text>
        <Text style={[styles.col, styles.colActions]}>Acciones</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={primary} />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.tableBody}>
          {filteredRows.map((row) => (
            <View key={row.id} style={styles.row}>
              <Text style={[styles.col, styles.colName]}>{row.name}</Text>
              <Text style={[styles.col, styles.colCat]}>{row.category?.nameEs ?? '-'}</Text>
              <Text style={[styles.col, styles.colCode]}>{row.code || '-'}</Text>
              <Text style={[styles.col, styles.colNum]}>{row.basePrice.toFixed(2)}</Text>
              <Text style={[styles.col, styles.colVariants]}>{row.variants.map((v) => v.name).join(', ') || '-'}</Text>
              <Text style={[styles.col, styles.colState, row.status === 1 ? styles.stateOn : styles.stateOff]}>
                {row.status === 1 ? 'Activo' : 'Inactivo'}
              </Text>
              <View style={[styles.colActionsWrap, styles.colActions, styles.actionsRow]}>
                <Pressable onPress={() => openEdit(row.id)}>
                  <Text style={styles.actionEdit}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => openProductHistory(row)}>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Editar' : 'Nuevo'}</Text>
              <Pressable onPress={() => setOpenForm(false)}>
                <Feather name="x" size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
              {PRODUCT_TABS.map((tab) => {
                const active = tab.key === activeTab;
                return (
                  <Pressable
                    key={tab.key}
                    style={[styles.tabItem, active && { borderBottomColor: primary }]}
                    onPress={() => setActiveTab(tab.key)}
                  >
                    <View style={styles.tabInline}>
                      <Feather name={tab.icon} size={15} color={active ? primary : '#3F3F46'} />
                      <Text style={[styles.tabLabel, active && { color: primary }]}>{tab.label}</Text>
                      {tab.badge ? <Text style={styles.tabBadge}>{tab.badge}</Text> : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.divider} />
            {renderTabContent()}
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setOpenForm(false)}>
                <Text style={styles.cancelBtnText}>Cerrar</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtnLarge, { backgroundColor: primary }, saving && styles.disabled]}
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

      <Modal visible={openTaxSelect} transparent animationType="fade" onRequestClose={() => setOpenTaxSelect(false)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Selecciona impuesto</Text>
            <ScrollView contentContainerStyle={styles.pickerList}>
              {AVAILABLE_TAXES.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.pickerItem, selectedTaxOption === item && { borderColor: primary, backgroundColor: `${primary}14` }]}
                  onPress={() => {
                    setSelectedTaxOption(item);
                    setOpenTaxSelect(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.cancelBtn} onPress={() => setOpenTaxSelect(false)}>
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
  primaryBtn: { borderRadius: 8, paddingHorizontal: 12, height: 36, alignItems: 'center', justifyContent: 'center' },
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
  errorBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    padding: 10,
  },
  errorText: { color: '#991B1B', fontWeight: '600', fontSize: 13 },
  successBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    padding: 10,
  },
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
  colName: { width: 150 },
  colCat: { width: 120 },
  colCode: { width: 80 },
  colNum: { width: 90 },
  colVariants: { width: 220 },
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
    backgroundColor: 'rgba(0,0,0,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  modalCard: { width: '100%', maxWidth: 1320, borderRadius: 4, backgroundColor: '#FFFFFF', padding: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: '#111827', fontSize: 38, fontWeight: '700' },
  tabsRow: { marginTop: 10, paddingBottom: 4, gap: 10 },
  tabItem: { borderBottomWidth: 2, borderBottomColor: 'transparent', paddingHorizontal: 8, paddingBottom: 9 },
  tabInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabLabel: { color: '#3F3F46', fontWeight: '700', fontSize: 15 },
  tabBadge: { color: '#DC2626', fontSize: 11, fontWeight: '700' },
  divider: { marginTop: 2, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabBody: {
    minHeight: 440,
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 8,
    marginTop: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  avatarWrap: { alignItems: 'center', marginBottom: 12 },
  avatarCircle: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 38, fontWeight: '500' },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  fieldWrap: { width: '49%' },
  label: { color: '#6B7280', fontWeight: '700', fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    height: 48,
    paddingHorizontal: 12,
    fontSize: 18,
    color: '#1F2937',
  },
  textarea: { minHeight: 76, height: 76, textAlignVertical: 'top', paddingTop: 10 },
  selectField: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { color: '#374151', fontWeight: '600', fontSize: 16 },
  switchArea: { marginTop: 14, flexDirection: 'row', gap: 30 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { color: '#1F2937', fontWeight: '700', fontSize: 18 },
  centerTitle: { fontSize: 48, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 16 },
  taxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
  taxSelectWrap: { flex: 1 },
  taxAddWrap: { width: 100, alignItems: 'center' },
  squareBtn: { width: 56, height: 56, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  taxListWrap: { marginTop: 18, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 16, gap: 8 },
  taxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  taxName: { color: '#111827', fontWeight: '600', fontSize: 16 },
  emptyTabText: { color: '#111827', fontSize: 34, fontWeight: '600', textAlign: 'center', marginTop: 22 },
  variantTopRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  variantShort: { flex: 1 },
  variantPriceWrap: { width: 300 },
  variantList: { marginTop: 16 },
  variantRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  variantName: { flex: 1 },
  variantPrice: { width: 190 },
  removeVariantBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  comingSoonWrap: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalActions: { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  cancelBtnText: { color: '#334155', fontWeight: '600', fontSize: 14 },
  primaryBtnLarge: { borderRadius: 8, paddingHorizontal: 18, height: 46, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pickerCard: { width: '100%', maxWidth: 460, maxHeight: 520, borderRadius: 10, backgroundColor: '#FFFFFF', padding: 14, gap: 10 },
  pickerTitle: { color: '#0F172A', fontWeight: '700', fontSize: 16 },
  pickerList: { gap: 8 },
  pickerItem: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: '#FFFFFF' },
  pickerItemText: { color: '#334155', fontWeight: '600', fontSize: 13 },
});
