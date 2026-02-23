import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { tableApi } from '@/services/tableApi';
import { getApiErrorMessage } from '@/services/http';
import type { TableRecord, ZoneRecord } from '@/types/table';

type Props = {
  primary: string;
  secondary: string;
  tertiary: string;
};

export default function TablesWorkspace({ primary, secondary, tertiary }: Props) {
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [activeZoneId, setActiveZoneId] = useState<string>('all');
  const [zoneModal, setZoneModal] = useState(false);
  const [tableModal, setTableModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingZone, setSavingZone] = useState(false);
  const [savingTable, setSavingTable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [zoneName, setZoneName] = useState('');
  const [zoneDescription, setZoneDescription] = useState('');
  const [zoneColor, setZoneColor] = useState('#38BDF8');

  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  const [tableCode, setTableCode] = useState('');
  const [tableZoneId, setTableZoneId] = useState<string>('');
  const [tableDeliveryOrCash, setTableDeliveryOrCash] = useState(false);
  const [tableActive, setTableActive] = useState(true);

  const loadWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tableApi.getWorkspace();
      setZones(data.zones);
      setTables(data.tables);
      const firstZone = data.zones[0];
      if (!tableZoneId && firstZone) {
        setTableZoneId(String(firstZone.id));
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [tableZoneId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const visibleTables = useMemo(
    () =>
      activeZoneId === 'all'
        ? tables
        : tables.filter((table) => table.zoneId === Number(activeZoneId)),
    [activeZoneId, tables]
  );

  const createZone = async () => {
    if (!zoneName.trim()) {
      setError('El nombre de la zona es obligatorio.');
      return;
    }
    try {
      setSavingZone(true);
      setError(null);
      const created = await tableApi.createZone({
        name: zoneName.trim(),
        description: zoneDescription.trim() || null,
        color: zoneColor.trim() || '#38BDF8',
      });
      setZones((prev) => [...prev, created]);
      setActiveZoneId(String(created.id));
      setTableZoneId(String(created.id));
      setZoneName('');
      setZoneDescription('');
      setZoneColor('#38BDF8');
      setZoneModal(false);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSavingZone(false);
    }
  };

  const createTable = async () => {
    if (!tableName.trim()) {
      setError('El nombre de la mesa es obligatorio.');
      return;
    }
    if (!tableZoneId) {
      setError('Debes seleccionar una zona.');
      return;
    }

    try {
      setSavingTable(true);
      setError(null);
      const created = await tableApi.createTable({
        zoneId: Number(tableZoneId),
        name: tableName.trim(),
        description: tableDescription.trim() || null,
        accessCode: tableCode.trim() || null,
        isDeliveryOrCash: tableDeliveryOrCash,
      });

      let finalTable = created;
      if (!tableActive) {
        finalTable = await tableApi.updateTable(created.id, { status: 0 });
      }

      setTables((prev) => [...prev, finalTable]);
      setTableName('');
      setTableDescription('');
      setTableCode('');
      setTableDeliveryOrCash(false);
      setTableActive(true);
      setTableModal(false);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSavingTable(false);
    }
  };

  const removeTable = (id: number) => {
    Alert.alert('Eliminar mesa', '¿Seguro que deseas eliminar esta mesa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setError(null);
            await tableApi.deleteTable(id);
            setTables((prev) => prev.filter((table) => table.id !== id));
          } catch (e) {
            setError(getApiErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: secondary }]}>Configuración de Mesas y Zonas</Text>
        <View style={styles.headerActions}>
          <Pressable style={[styles.ghostButton, { borderColor: secondary }]} onPress={() => setZoneModal(true)}>
            <Text style={[styles.ghostButtonText, { color: secondary }]}>+ Zona</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: primary }]}
            onPress={() => setTableModal(true)}
            disabled={!zones.length}
          >
            <Text style={[styles.primaryButtonText, { color: tertiary }]}>+ Mesa</Text>
          </Pressable>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zoneStrip}>
        <Pressable
          style={[styles.zoneChip, activeZoneId === 'all' && { backgroundColor: secondary }]}
          onPress={() => setActiveZoneId('all')}
        >
          <Text style={[styles.zoneChipText, activeZoneId === 'all' && { color: tertiary }]}>Todas</Text>
        </Pressable>
        {zones.map((zone) => {
          const selected = String(zone.id) === activeZoneId;
          return (
            <Pressable
              key={zone.id}
              style={[styles.zoneChip, selected && { backgroundColor: zone.color }]}
              onPress={() => setActiveZoneId(String(zone.id))}
            >
              <Text style={[styles.zoneChipText, selected && { color: '#FFFFFF' }]}>{zone.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={primary} />
          <Text style={styles.loadingText}>Cargando mesas...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.tablesGrid}>
          {visibleTables.map((table) => {
            const zone = zones.find((z) => z.id === table.zoneId);
            return (
              <View key={table.id} style={styles.tableCard}>
                <View style={[styles.tableShape, { borderLeftColor: zone?.color ?? '#84CC16' }]}>
                  <View style={styles.chairTop} />
                  <View style={styles.chairLeft} />
                  <View style={styles.chairRight} />
                  <View style={styles.chairBottom} />
                  <Text style={styles.tableName}>{table.name}</Text>
                  <Text style={styles.tableStatus}>{table.status === 1 ? 'Disponible' : 'Inactiva'}</Text>
                </View>
                <Text style={styles.zoneName}>{zone?.name ?? 'Sin zona'}</Text>
                <View style={styles.rowActions}>
                  <Pressable onPress={() => removeTable(table.id)}>
                    <Text style={styles.actionDelete}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={tableModal} transparent animationType="fade" onRequestClose={() => setTableModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mesa</Text>
            <TextInput style={styles.input} placeholder="Nombre" value={tableName} onChangeText={setTableName} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripcion"
              value={tableDescription}
              onChangeText={setTableDescription}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Contrasena de acceso"
              value={tableCode}
              onChangeText={setTableCode}
            />

            <Text style={styles.sectionLabel}>Zona</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zonePickRow}>
              {zones.map((zone) => (
                <Pressable
                  key={zone.id}
                  style={[
                    styles.zonePick,
                    tableZoneId === String(zone.id) && {
                      borderColor: zone.color,
                      backgroundColor: `${zone.color}22`,
                    },
                  ]}
                  onPress={() => setTableZoneId(String(zone.id))}
                >
                  <Text style={styles.zonePickText}>{zone.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Es para entrega a domicilio o ventas en caja</Text>
              <Switch value={tableDeliveryOrCash} onValueChange={setTableDeliveryOrCash} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Activa</Text>
              <Switch value={tableActive} onValueChange={setTableActive} />
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setTableModal(false)}>
                <Text style={styles.modalCancelText}>Cerrar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSave, { backgroundColor: primary }, savingTable && styles.disabled]}
                onPress={createTable}
                disabled={savingTable}
              >
                <Text style={[styles.modalSaveText, { color: tertiary }]}>
                  {savingTable ? 'Guardando...' : 'Guardar cambios'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={zoneModal} transparent animationType="fade" onRequestClose={() => setZoneModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nueva zona</Text>
            <TextInput style={styles.input} placeholder="Nombre de zona" value={zoneName} onChangeText={setZoneName} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripcion"
              value={zoneDescription}
              onChangeText={setZoneDescription}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Color HEX (#22C55E)"
              value={zoneColor}
              onChangeText={setZoneColor}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setZoneModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSave, { backgroundColor: primary }, savingZone && styles.disabled]}
                onPress={createZone}
                disabled={savingZone}
              >
                <Text style={[styles.modalSaveText, { color: tertiary }]}>
                  {savingZone ? 'Creando...' : 'Crear zona'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontSize: 23, fontWeight: '900' },
  headerActions: { flexDirection: 'row', gap: 8 },
  ghostButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8 },
  ghostButtonText: { fontWeight: '700' },
  primaryButton: { borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8 },
  primaryButtonText: { fontWeight: '700' },
  errorBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  errorText: { color: '#991B1B', fontWeight: '700', fontSize: 12 },
  zoneStrip: { gap: 8, paddingTop: 12, paddingBottom: 8 },
  zoneChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  zoneChipText: { color: '#334155', fontWeight: '700', fontSize: 12 },
  loadingWrap: { marginTop: 24, alignItems: 'center', gap: 8 },
  loadingText: { color: '#64748B', fontWeight: '700' },
  tablesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingVertical: 10 },
  tableCard: { width: 128, alignItems: 'center' },
  tableShape: {
    width: 90,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 10,
    borderLeftColor: '#84CC16',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  chairTop: { position: 'absolute', top: -9, width: 30, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
  chairBottom: { position: 'absolute', bottom: -9, width: 30, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
  chairLeft: { position: 'absolute', left: -9, width: 8, height: 34, borderRadius: 4, backgroundColor: '#CBD5E1' },
  chairRight: { position: 'absolute', right: -9, width: 8, height: 34, borderRadius: 4, backgroundColor: '#CBD5E1' },
  tableName: { fontWeight: '800', fontSize: 13, color: '#0F172A' },
  tableStatus: { marginTop: 5, fontWeight: '700', fontSize: 12, color: '#64748B' },
  zoneName: { marginTop: 12, fontWeight: '700', color: '#475569', fontSize: 12 },
  rowActions: { flexDirection: 'row', gap: 7, marginTop: 3 },
  actionDelete: { color: '#DC2626', fontSize: 12, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: { width: '100%', maxWidth: 560, borderRadius: 6, backgroundColor: '#FFFFFF', padding: 14 },
  modalTitle: { fontWeight: '900', fontSize: 21, color: '#0F172A', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  textArea: { minHeight: 86, textAlignVertical: 'top' },
  sectionLabel: { fontWeight: '700', color: '#334155', marginBottom: 6 },
  zonePickRow: { gap: 8, paddingBottom: 8 },
  zonePick: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  zonePickText: { fontWeight: '600', color: '#334155' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 4, marginBottom: 6 },
  switchLabel: { fontSize: 12, color: '#334155', flex: 1, fontWeight: '600' },
  modalActions: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  modalCancel: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  modalCancelText: { color: '#475569', fontWeight: '700' },
  modalSave: { borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  modalSaveText: { fontWeight: '800' },
  disabled: { opacity: 0.5 },
});
