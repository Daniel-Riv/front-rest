import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Row = {
  id: number | string;
  action: string;
  createdAt: string;
  changedFields: Record<string, unknown>;
};

type Props = {
  visible: boolean;
  title: string;
  loading: boolean;
  rows: Row[];
  onClose: () => void;
  accentColor: string;
};

export default function HistoryModal({ visible, title, loading, rows, onClose, accentColor }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, styles.historyCard]}>
          <Text style={styles.modalTitle}>{title}</Text>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={accentColor} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.historyList}>
              {rows.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <Text style={styles.historyTitle}>
                    {item.action.toUpperCase()} - {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  <Text style={styles.historyJson}>{JSON.stringify(item.changedFields)}</Text>
                </View>
              ))}
              {!rows.length ? <Text style={styles.emptyText}>Sin historial</Text> : null}
            </ScrollView>
          )}
          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: { width: '100%', maxWidth: 700, borderRadius: 10, backgroundColor: '#FFFFFF', padding: 14 },
  historyCard: { maxHeight: 520 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  loadingWrap: { paddingVertical: 22, alignItems: 'center', gap: 8 },
  historyList: { gap: 8 },
  historyItem: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  historyTitle: { color: '#0F172A', fontWeight: '700', marginBottom: 4, fontSize: 13 },
  historyJson: { color: '#334155', fontSize: 12, fontWeight: '500' },
  emptyText: { color: '#64748B', fontWeight: '600' },
  modalActions: { marginTop: 6, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: { color: '#334155', fontWeight: '600' },
});
