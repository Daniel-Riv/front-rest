import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Action = {
  label: string;
  color: string;
  onPress: () => void;
};

type Props = {
  title: string;
  subtitle?: string;
  description?: string;
  badge: React.ReactNode;
  metaItems?: string[];
  actions: Action[];
};

export default function EntityCard({ title, subtitle, description, badge, metaItems = [], actions }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.badgeWrap}>{badge}</View>
        <View style={styles.cardTexts}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
        </View>
      </View>
      {description ? <Text style={styles.cardDesc}>{description}</Text> : null}
      {metaItems.length ? (
        <View style={styles.metaRow}>
          {metaItems.map((item) => (
            <Text key={item} style={styles.metaText}>
              {item}
            </Text>
          ))}
        </View>
      ) : null}
      <View style={styles.actions}>
        {actions.map((action) => (
          <Pressable key={action.label} style={styles.actionBtn} onPress={action.onPress}>
            <Text style={[styles.actionText, { color: action.color }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badgeWrap: { alignItems: 'center', justifyContent: 'center' },
  cardTexts: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  cardSub: { color: '#64748B', fontWeight: '500', fontSize: 13, marginTop: 1 },
  cardDesc: { color: '#334155', fontWeight: '500', fontSize: 13 },
  metaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  actions: { marginTop: 2, flexDirection: 'row', gap: 8 },
  actionBtn: { paddingVertical: 3, paddingHorizontal: 1 },
  actionText: { fontWeight: '700', fontSize: 13 },
});
