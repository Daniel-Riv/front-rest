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
import { supplierApi } from '@/services/supplierApi';
import { getApiErrorMessage } from '@/services/http';
import type { SupplierHistoryItem, SupplierPayload, SupplierRecord } from '@/types/supplier';
import HistoryModal from '@/components/common/HistoryModal';

type Props = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type FormState = {
  name: string;
  commercialName: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  contact: string;
  note: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  name: '',
  commercialName: '',
  document: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  contact: '',
  note: '',
  active: true,
};

export default function SuppliersWorkspace({ primary, secondary, tertiary }: Props) {
  const [rows, setRows] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState<SupplierHistoryItem[]>([]);
  const [historyTitle, setHistoryTitle] = useState('');

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.name, row.commercialName ?? '', row.document, row.phone ?? ''].join(' ').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const loadRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierApi.list();
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
    setError(null);
    setOpenForm(true);
  };

  const openEdit = async (id: number) => {
    try {
      setError(null);
      const item = await supplierApi.getById(id);
      setEditingId(item.id);
      setForm({
        name: item.name,
        commercialName: item.commercialName ?? '',
        document: item.document,
        email: item.email ?? '',
        phone: item.phone ?? '',
        address: item.address ?? '',
        website: item.website ?? '',
        contact: item.contact ?? '',
        note: item.note ?? '',
        active: item.status === 1,
      });
      setOpenForm(true);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const openSupplierHistory = async (row: SupplierRecord) => {
    try {
      setOpenHistory(true);
      setHistoryLoading(true);
      setHistoryRows([]);
      setHistoryTitle(row.name);
      const data = await supplierApi.getHistory(row.id);
      setHistoryRows(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setHistoryLoading(false);
    }
  };

  const buildPayload = (): SupplierPayload => ({
    name: form.name.trim(),
    commercialName: form.commercialName.trim() || null,
    document: form.document.trim(),
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    address: form.address.trim() || null,
    website: form.website.trim() || null,
    contact: form.contact.trim() || null,
    note: form.note.trim() || null,
    status: form.active ? 1 : 0,
  });

  const save = async () => {
    if (!form.name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!form.document.trim()) {
      setError('El documento es obligatorio.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = buildPayload();
      if (editingId) {
        const updated = await supplierApi.update(editingId, payload);
        setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSuccess('Proveedor actualizado.');
      } else {
        const created = await supplierApi.create(payload);
        setRows((prev) => [created, ...prev]);
        setSuccess('Proveedor creado.');
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
      await supplierApi.remove(id);
      setRows((prev) => prev.filter((item) => item.id !== id));
      setSuccess('Proveedor eliminado.');
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: secondary }]}>Proveedores</Text>
          <Text style={styles.subtitle}>Gestión de datos y contacto de proveedores</Text>
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
          placeholder="nombre, documento, comercial..."
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
        <Text style={[styles.col, styles.colName]}>Nombre</Text>
        <Text style={[styles.col, styles.colCommercial]}>Nombre Comercial</Text>
        <Text style={[styles.col, styles.colDoc]}>Documento</Text>
        <Text style={[styles.col, styles.colPhone]}>Teléfono</Text>
        <Text style={[styles.col, styles.colAddress]}>Dirección</Text>
        <Text style={[styles.col, styles.colActions]}>Acciones</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={primary} />
          <Text style={styles.loadingText}>Cargando proveedores...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.tableBody}>
          {filteredRows.map((row) => (
            <View key={row.id} style={styles.row}>
              <Text style={[styles.col, styles.colName]}>{row.name}</Text>
              <Text style={[styles.col, styles.colCommercial]}>{row.commercialName || '-'}</Text>
              <Text style={[styles.col, styles.colDoc]}>{row.document}</Text>
              <Text style={[styles.col, styles.colPhone]}>{row.phone || '-'}</Text>
              <Text style={[styles.col, styles.colAddress]}>{row.address || '-'}</Text>
              <View style={[styles.colActions, styles.actionsRow]}>
                <Pressable onPress={() => openEdit(row.id)}>
                  <Text style={styles.actionEdit}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => openSupplierHistory(row)}>
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
            <Text style={styles.modalTitle}>Proveedor</Text>
            <TextInput style={styles.input} placeholder="Nombre*" value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} />
            <TextInput style={styles.input} placeholder="Nombre Comercial" value={form.commercialName} onChangeText={(v) => setForm((p) => ({ ...p, commercialName: v }))} />
            <TextInput style={styles.input} placeholder="Documento*" value={form.document} onChangeText={(v) => setForm((p) => ({ ...p, document: v }))} />
            <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={(v) => setForm((p) => ({ ...p, email: v }))} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Teléfono" value={form.phone} onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))} />
            <TextInput style={styles.input} placeholder="Dirección" value={form.address} onChangeText={(v) => setForm((p) => ({ ...p, address: v }))} />
            <TextInput style={styles.input} placeholder="Página Web" value={form.website} onChangeText={(v) => setForm((p) => ({ ...p, website: v }))} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Contacto" value={form.contact} onChangeText={(v) => setForm((p) => ({ ...p, contact: v }))} />
            <TextInput style={styles.input} placeholder="Nota" value={form.note} onChangeText={(v) => setForm((p) => ({ ...p, note: v }))} />
            <View style={styles.switchRow}>
              <Switch value={form.active} onValueChange={(value) => setForm((prev) => ({ ...prev, active: value }))} />
              <Text style={styles.switchLabel}>Activo</Text>
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setOpenForm(false)}>
                <Text style={styles.cancelBtnText}>Cerrar</Text>
              </Pressable>
              <Pressable style={[styles.primaryBtn, { backgroundColor: primary }, saving && styles.disabled]} onPress={save} disabled={saving}>
                <Text style={[styles.primaryBtnText, { color: tertiary }]}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
              </Pressable>
            </View>
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
  ghostBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  ghostBtnText: { fontWeight: '600', fontSize: 13 },
  primaryBtn: { borderRadius: 8, paddingHorizontal: 12, height: 36, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontWeight: '700', fontSize: 13 },
  searchRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchLabel: { color: '#334155', fontWeight: '600' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, height: 38, backgroundColor: '#FFFFFF' },
  errorBox: { marginTop: 10, borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, backgroundColor: '#FEF2F2', padding: 10 },
  errorText: { color: '#991B1B', fontWeight: '600', fontSize: 13 },
  successBox: { marginTop: 10, borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 10, backgroundColor: '#F0FDF4', padding: 10 },
  successText: { color: '#166534', fontWeight: '600', fontSize: 13 },
  tableHead: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 8, borderWidth: 1, borderColor: '#E2E8F0', borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center' },
  tableBody: { borderWidth: 1, borderTopWidth: 0, borderColor: '#E2E8F0', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  col: { color: '#0F172A', fontSize: 12, fontWeight: '500' },
  colName: { width: 170 },
  colCommercial: { width: 170 },
  colDoc: { width: 130 },
  colPhone: { width: 120 },
  colAddress: { width: 200 },
  colActions: { flex: 1 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionEdit: { color: '#0369A1', fontWeight: '700', fontSize: 12 },
  actionHistory: { color: '#6D28D9', fontWeight: '700', fontSize: 12 },
  actionDelete: { color: '#B91C1C', fontWeight: '700', fontSize: 12 },
  loadingWrap: { marginTop: 24, alignItems: 'center', gap: 8 },
  loadingText: { color: '#64748B', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 640, borderRadius: 10, backgroundColor: '#FFFFFF', padding: 14 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, marginBottom: 10, backgroundColor: '#FFFFFF' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  switchLabel: { color: '#334155', fontWeight: '600' },
  modalActions: { marginTop: 6, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  cancelBtnText: { color: '#334155', fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
