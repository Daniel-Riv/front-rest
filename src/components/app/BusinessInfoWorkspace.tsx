import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { businessInfoApi } from '@/services/businessInfoApi';
import { getApiErrorMessage } from '@/services/http';
import type { BusinessInfoHistoryItem, BusinessInfoPayload, BusinessInfoRecord } from '@/types/businessInfo';

type Props = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type FormState = {
  currentPlan: string;
  name: string;
  taxId: string;
  contact: string;
  email: string;
  address: string;
  country: string;
  department: string;
  city: string;
  phone: string;
  website: string;
  handlesElectronicInvoicing: boolean;
  hasIngredientProducts: boolean;
  usesTables: boolean;
  hasDelivery: boolean;
  logoUrl: string;
};

type DocumentFormState = {
  documentType: string;
  prefix: string;
  startNumber: string;
  suggestedTipPercent: string;
  documentNameField: string;
  note1: string;
  note2: string;
  note3: string;
  template: string;
  itemTextSize: string;
  showPrintSales: boolean;
  showLogo: boolean;
  showTotalLetters: boolean;
  useTurns: boolean;
  printOnOtherPage: boolean;
  showProductValuesBeforeTax: boolean;
};

type TabKey =
  | 'negocio'
  | 'documentos'
  | 'legal'
  | 'pagos'
  | 'objetivos'
  | 'avanzado'
  | 'moneda'
  | 'integraciones';

const TAB_ITEMS: Array<{ key: TabKey; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: 'negocio', label: 'Negocio', icon: 'briefcase' },
  { key: 'documentos', label: 'Documentos', icon: 'file-text' },
  { key: 'legal', label: 'Legal', icon: 'shield' },
  { key: 'pagos', label: 'Pagos', icon: 'credit-card' },
  { key: 'objetivos', label: 'Objetivos', icon: 'target' },
  { key: 'avanzado', label: 'Avanzado', icon: 'settings' },
  { key: 'moneda', label: 'Moneda', icon: 'dollar-sign' },
  { key: 'integraciones', label: 'Integraciones', icon: 'cpu' },
];

const EMPTY_FORM: FormState = {
  currentPlan: '',
  name: '',
  taxId: '',
  contact: '',
  email: '',
  address: '',
  country: '',
  department: '',
  city: '',
  phone: '',
  website: '',
  handlesElectronicInvoicing: false,
  hasIngredientProducts: false,
  usesTables: false,
  hasDelivery: false,
  logoUrl: '',
};

const EMPTY_DOCUMENT_FORM: DocumentFormState = {
  documentType: 'Factura',
  prefix: '',
  startNumber: '1',
  suggestedTipPercent: '0',
  documentNameField: 'NIT/Doc',
  note1: '',
  note2: '',
  note3: '',
  template: 'Tirilla',
  itemTextSize: '12px',
  showPrintSales: true,
  showLogo: false,
  showTotalLetters: false,
  useTurns: false,
  printOnOtherPage: true,
  showProductValuesBeforeTax: false,
};

function recordToForm(record: BusinessInfoRecord): FormState {
  return {
    currentPlan: record.currentPlan ?? '',
    name: record.name ?? '',
    taxId: record.taxId ?? '',
    contact: record.contact ?? '',
    email: record.email ?? '',
    address: record.address ?? '',
    country: record.country ?? '',
    department: record.department ?? '',
    city: record.city ?? '',
    phone: record.phone ?? '',
    website: record.website ?? '',
    handlesElectronicInvoicing: !!record.handlesElectronicInvoicing,
    hasIngredientProducts: !!record.hasIngredientProducts,
    usesTables: !!record.usesTables,
    hasDelivery: !!record.hasDelivery,
    logoUrl: record.logoUrl ?? '',
  };
}

function trimOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function formToPayload(form: FormState): BusinessInfoPayload {
  return {
    currentPlan: trimOrNull(form.currentPlan),
    name: form.name.trim(),
    taxId: form.taxId.trim(),
    contact: trimOrNull(form.contact),
    email: trimOrNull(form.email),
    address: trimOrNull(form.address),
    country: trimOrNull(form.country),
    department: trimOrNull(form.department),
    city: trimOrNull(form.city),
    phone: trimOrNull(form.phone),
    website: trimOrNull(form.website),
    handlesElectronicInvoicing: form.handlesElectronicInvoicing,
    hasIngredientProducts: form.hasIngredientProducts,
    usesTables: form.usesTables,
    hasDelivery: form.hasDelivery,
    logoUrl: trimOrNull(form.logoUrl),
  };
}

export default function BusinessInfoWorkspace({ primary, secondary, tertiary }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('negocio');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [snapshot, setSnapshot] = useState<FormState>(EMPTY_FORM);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [history, setHistory] = useState<BusinessInfoHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [documentForm, setDocumentForm] = useState<DocumentFormState>(EMPTY_DOCUMENT_FORM);
  const [documentSnapshot, setDocumentSnapshot] = useState<DocumentFormState>(EMPTY_DOCUMENT_FORM);
  const [documentSuccess, setDocumentSuccess] = useState<string | null>(null);

  const loadHistory = useCallback(async (id: number) => {
    try {
      const data = await businessInfoApi.getHistory(id);
      setHistory(data);
    } catch {
      setHistory([]);
    }
  }, []);

  const loadCurrent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const current = await businessInfoApi.getCurrent();
      if (!current) {
        setRecordId(null);
        setForm(EMPTY_FORM);
        setSnapshot(EMPTY_FORM);
        setHistory([]);
        return;
      }
      const next = recordToForm(current);
      setRecordId(current.id);
      setForm(next);
      setSnapshot(next);
      await loadHistory(current.id);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [loadHistory]);

  useEffect(() => {
    loadCurrent();
  }, [loadCurrent]);

  const hasChanges = useMemo(() => JSON.stringify(form) !== JSON.stringify(snapshot), [form, snapshot]);
  const hasDocumentChanges = useMemo(
    () => JSON.stringify(documentForm) !== JSON.stringify(documentSnapshot),
    [documentForm, documentSnapshot]
  );

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateDocumentField = <K extends keyof DocumentFormState>(key: K, value: DocumentFormState[K]) => {
    setDocumentForm((prev) => ({ ...prev, [key]: value }));
    setDocumentSuccess(null);
  };

  const save = async () => {
    if (saving) return;
    if (!form.name.trim()) {
      setError('El nombre de la empresa es obligatorio.');
      return;
    }
    if (!form.taxId.trim()) {
      setError('El RUT / NIT es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = formToPayload(form);
      const saved = recordId
        ? await businessInfoApi.update(recordId, payload)
        : await businessInfoApi.create(payload);
      const next = recordToForm(saved);
      setRecordId(saved.id);
      setForm(next);
      setSnapshot(next);
      setSuccess('Información guardada correctamente.');
      await loadHistory(saved.id);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(snapshot);
    setError(null);
    setSuccess(null);
  };

  const resetDocumentForm = () => {
    setDocumentForm(documentSnapshot);
    setDocumentSuccess(null);
  };

  const saveDocumentSettings = () => {
    setDocumentSnapshot(documentForm);
    setDocumentSuccess('Configuración de documento guardada correctamente.');
  };

  const previewDocumentSettings = () => {
    Alert.alert(
      'Vista previa',
      `Tipo: ${documentForm.documentType}\nPrefijo: ${documentForm.prefix || '-'}\nInicio: ${
        documentForm.startNumber
      }\nPropina: ${documentForm.suggestedTipPercent}%\nPlantilla: ${documentForm.template}`
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TAB_ITEMS.map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.tab,
                  selected && {
                    borderColor: primary,
                    backgroundColor: `${primary}18`,
                  },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Feather name={tab.icon} size={16} color={selected ? primary : '#475569'} />
                <Text style={[styles.tabText, selected && { color: primary }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeTab === 'documentos' ? (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionIconWrap, { backgroundColor: `${primary}20` }]}>
                <Feather name="file-text" size={20} color={primary} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: secondary }]}>Documento</Text>
                <Text style={styles.sectionSub}>Configuración de impresión y visualización</Text>
              </View>
            </View>

            {documentSuccess ? (
              <View style={styles.successBox}>
                <Feather name="check-circle" size={16} color="#166534" />
                <Text style={styles.successText}>{documentSuccess}</Text>
              </View>
            ) : null}

            <View style={styles.grid}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Tipo de documento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Factura"
                  value={documentForm.documentType}
                  onChangeText={(value) => updateDocumentField('documentType', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Prefijo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="FV"
                  value={documentForm.prefix}
                  onChangeText={(value) => updateDocumentField('prefix', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}># de inicio</Text>
                <TextInput
                  style={styles.input}
                  value={documentForm.startNumber}
                  keyboardType="numeric"
                  onChangeText={(value) => updateDocumentField('startNumber', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>% de propina sugerida</Text>
                <TextInput
                  style={styles.input}
                  value={documentForm.suggestedTipPercent}
                  keyboardType="numeric"
                  onChangeText={(value) => updateDocumentField('suggestedTipPercent', value)}
                />
              </View>
              <View style={[styles.inputWrap, styles.full]}>
                <Text style={styles.label}>Nombre de documento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="NIT/Doc"
                  value={documentForm.documentNameField}
                  onChangeText={(value) => updateDocumentField('documentNameField', value)}
                />
              </View>
              <View style={[styles.inputWrap, styles.full]}>
                <Text style={styles.label}>Nota 1</Text>
                <TextInput
                  style={styles.input}
                  value={documentForm.note1}
                  onChangeText={(value) => updateDocumentField('note1', value)}
                />
              </View>
              <View style={[styles.inputWrap, styles.full]}>
                <Text style={styles.label}>Nota 2</Text>
                <TextInput
                  style={styles.input}
                  value={documentForm.note2}
                  onChangeText={(value) => updateDocumentField('note2', value)}
                />
              </View>
              <View style={[styles.inputWrap, styles.full]}>
                <Text style={styles.label}>Nota 3</Text>
                <TextInput
                  style={styles.input}
                  value={documentForm.note3}
                  onChangeText={(value) => updateDocumentField('note3', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Plantilla</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tirilla"
                  value={documentForm.template}
                  onChangeText={(value) => updateDocumentField('template', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Tamaño texto ítems</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12px"
                  value={documentForm.itemTextSize}
                  onChangeText={(value) => updateDocumentField('itemTextSize', value)}
                />
              </View>
            </View>

            <View style={styles.switchList}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Mostrar ventas de impresión</Text>
                <Switch
                  value={documentForm.showPrintSales}
                  onValueChange={(value) => updateDocumentField('showPrintSales', value)}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Mostrar logo</Text>
                <Switch value={documentForm.showLogo} onValueChange={(value) => updateDocumentField('showLogo', value)} />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Mostrar total en letras</Text>
                <Switch
                  value={documentForm.showTotalLetters}
                  onValueChange={(value) => updateDocumentField('showTotalLetters', value)}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Utilizar turnos</Text>
                <Switch value={documentForm.useTurns} onValueChange={(value) => updateDocumentField('useTurns', value)} />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Imprimir en otra página</Text>
                <Switch
                  value={documentForm.printOnOtherPage}
                  onValueChange={(value) => updateDocumentField('printOnOtherPage', value)}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Mostrar valor productos antes de impuesto</Text>
                <Switch
                  value={documentForm.showProductValuesBeforeTax}
                  onValueChange={(value) => updateDocumentField('showProductValuesBeforeTax', value)}
                />
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable style={[styles.cancelBtn, !hasDocumentChanges && styles.disabledBtn]} onPress={resetDocumentForm}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.cancelBtn]} onPress={previewDocumentSettings}>
                <Text style={styles.cancelBtnText}>Vista previa</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: primary }, !hasDocumentChanges && styles.disabledBtn]}
                onPress={saveDocumentSettings}
              >
                <Text style={[styles.saveBtnText, { color: tertiary }]}>Guardar cambios</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : activeTab !== 'negocio' ? (
          <View style={styles.placeholderBox}>
            <Feather name="clock" size={18} color={primary} />
            <Text style={[styles.placeholderTitle, { color: secondary }]}>Módulo en construcción</Text>
            <Text style={styles.placeholderSub}>
              Esta pestaña estará lista en la siguiente iteración.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionIconWrap, { backgroundColor: `${primary}20` }]}>
                <Feather name="briefcase" size={20} color={primary} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: secondary }]}>Información del Negocio</Text>
                <Text style={styles.sectionSub}>Datos principales de tu empresa</Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.statusRow}>
                <ActivityIndicator color={primary} />
                <Text style={styles.statusText}>Cargando información...</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Feather name="check-circle" size={16} color="#166534" />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <View style={styles.grid}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Plan Actual</Text>
                <TextInput
                  style={styles.input}
                  placeholder="UNIVERSAL"
                  value={form.currentPlan}
                  onChangeText={(value) => updateField('currentPlan', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>RUT / NIT</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9000000"
                  value={form.taxId}
                  onChangeText={(value) => updateField('taxId', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Nombre de la Empresa</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del negocio"
                  value={form.name}
                  onChangeText={(value) => updateField('name', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Contacto</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de contacto"
                  value={form.contact}
                  onChangeText={(value) => updateField('contact', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Email Corporativo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="correo@empresa.com"
                  value={form.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={(value) => updateField('email', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Sitio Web</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://www.tunegocio.com"
                  value={form.website}
                  autoCapitalize="none"
                  onChangeText={(value) => updateField('website', value)}
                />
              </View>
              <View style={[styles.inputWrap, styles.full]}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Calle principal #00-00"
                  value={form.address}
                  onChangeText={(value) => updateField('address', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>País</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Colombia"
                  value={form.country}
                  onChangeText={(value) => updateField('country', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Departamento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Departamento"
                  value={form.department}
                  onChangeText={(value) => updateField('department', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ciudad"
                  value={form.city}
                  onChangeText={(value) => updateField('city', value)}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3000000000"
                  value={form.phone}
                  onChangeText={(value) => updateField('phone', value)}
                />
              </View>
              <View style={[styles.inputWrap, styles.full]}>
                <Text style={styles.label}>Logo URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  value={form.logoUrl}
                  autoCapitalize="none"
                  onChangeText={(value) => updateField('logoUrl', value)}
                />
              </View>
            </View>

            <View style={styles.switchList}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Maneja facturación electrónica</Text>
                <Switch
                  value={form.handlesElectronicInvoicing}
                  onValueChange={(value) => updateField('handlesElectronicInvoicing', value)}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Productos con ingredientes</Text>
                <Switch
                  value={form.hasIngredientProducts}
                  onValueChange={(value) => updateField('hasIngredientProducts', value)}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Utiliza mesas</Text>
                <Switch value={form.usesTables} onValueChange={(value) => updateField('usesTables', value)} />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Envío a domicilio</Text>
                <Switch value={form.hasDelivery} onValueChange={(value) => updateField('hasDelivery', value)} />
              </View>
            </View>

            <View style={styles.notice}>
              <Feather name="info" size={16} color={primary} />
              <Text style={styles.noticeText}>
                Asegúrate de que esta información esté correcta. Se usará en documentos y comunicaciones.
              </Text>
            </View>

            {history.length ? (
              <View style={styles.historyBox}>
                <Text style={[styles.historyTitle, { color: secondary }]}>Últimos cambios</Text>
                {history.slice(0, 5).map((item) => (
                  <Text key={item.id} style={styles.historyItem}>
                    {new Date(item.createdAt).toLocaleString()} - {item.action === 'create' ? 'Creación' : 'Actualización'}
                  </Text>
                ))}
              </View>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                style={[styles.cancelBtn, !hasChanges && styles.disabledBtn]}
                onPress={resetForm}
                disabled={!hasChanges || saving}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: primary }, (!hasChanges || loading || saving) && styles.disabledBtn]}
                onPress={save}
                disabled={!hasChanges || loading || saving}
              >
                <Text style={[styles.saveBtnText, { color: tertiary }]}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tabsRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  content: { padding: 18, gap: 12 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 30, fontWeight: '900' },
  sectionSub: { color: '#64748B', fontWeight: '500', marginTop: 2 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  statusText: { color: '#64748B', fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inputWrap: { width: '48%' },
  full: { width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  switchList: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 12,
    gap: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  switchLabel: { color: '#1E293B', fontWeight: '600', fontSize: 14, flexShrink: 1 },
  notice: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeText: { color: '#1E40AF', fontWeight: '600', flexShrink: 1 },
  historyBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  historyTitle: { fontSize: 14, fontWeight: '800' },
  historyItem: { color: '#475569', fontSize: 13, fontWeight: '500' },
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: { color: '#991B1B', fontWeight: '700', flexShrink: 1 },
  successBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: { color: '#166534', fontWeight: '700', flexShrink: 1 },
  actions: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: '#334155', fontWeight: '800', fontSize: 14 },
  saveBtn: {
    borderRadius: 12,
    paddingHorizontal: 18,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontWeight: '800', fontSize: 14 },
  disabledBtn: { opacity: 0.45 },
  placeholderBox: {
    margin: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
  },
  placeholderTitle: { fontSize: 18, fontWeight: '900' },
  placeholderSub: { color: '#64748B', fontWeight: '600' },
});
