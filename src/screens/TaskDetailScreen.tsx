// ============================================================
// TaskDetailScreen – Full task details with edit option
// ============================================================
import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {MainStackParamList} from '../types';
import {formatDate, daysUntilDeadline, deadlineColor} from '../utils/helpers';
import GradientButton from '../components/GradientButton';
import {useTheme} from '../hooks/useTheme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'TaskDetail'>;
  route: RouteProp<MainStackParamList, 'TaskDetail'>;
};

const TaskDetailScreen: React.FC<Props> = ({navigation, route}) => {
  const {colors} = useTheme();
  const {task} = route.params;
  const days = daysUntilDeadline(task.deadline ?? '');
  const dColor = deadlineColor(task.deadline ?? '');

  const priorityColor = (p: string) =>
    p === 'high' ? colors.priorityHigh : p === 'medium' ? colors.priorityMedium : colors.priorityLow;

  return (
    <View style={[styles.container, {backgroundColor: colors.bgDark}]}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: colors.border}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{color: colors.primaryLight, fontSize: 16, fontWeight: '600'}}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>Task Detail</Text>
        <View style={{width: 60}} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title & Status */}
        <View style={styles.titleRow}>
          <View
            style={[styles.priorityDot, {backgroundColor: priorityColor(task.priority)}]}
          />
          <Text style={[styles.title, {color: colors.textPrimary}, task.isCompleted && {textDecorationLine: 'line-through', color: colors.textMuted}]}>
            {task.title}
          </Text>
          {task.isCompleted && (
            <View style={[styles.doneBadge, {backgroundColor: colors.success + '25', borderColor: colors.success}]}>
              <Text style={{color: colors.success, fontWeight: '700', fontSize: 12}}>✓ Done</Text>
            </View>
          )}
        </View>

        {/* Meta cards */}
        <View style={styles.metaGrid}>
          {[
            {icon: '📅', label: 'Created', value: formatDate(task.createdAt)},
            {icon: '⏰', label: 'Deadline', value: task.isPasswordRecord ? 'N/A' : formatDate(task.deadline)},
            {
              icon: '🎯',
              label: 'Priority',
              value: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
              valueColor: priorityColor(task.priority),
            },
            {icon: '🏷️', label: 'Category', value: task.category},
          ].map(m => (
            <View key={m.label} style={[styles.metaCard, {backgroundColor: colors.bgCard, borderColor: colors.border}]}>
              <Text style={styles.metaIcon}>{m.icon}</Text>
              <Text style={[styles.metaLabel, {color: colors.textMuted}]}>{m.label}</Text>
              <Text style={[styles.metaValue, {color: colors.textPrimary}, m.valueColor ? {color: m.valueColor} : undefined]}>
                {m.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Deadline status pill (hide for passwords) */}
        {!task.isPasswordRecord && (
          <View style={[styles.deadlinePill, {backgroundColor: dColor + '20', borderColor: dColor}]}>
            <Text style={[styles.deadlineText, {color: dColor}]}>
              {days < 0
                ? `⚠️ Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
                : days === 0
                ? '🔥 Due today!'
                : `✅ ${days} day${days !== 1 ? 's' : ''} remaining`}
            </Text>
          </View>
        )}

        {/* Description / Password */}
        {!!task.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>{task.isPasswordRecord ? 'Password / Key' : 'Description'}</Text>
            <Text style={[styles.descriptionText, {color: colors.textPrimary, backgroundColor: colors.bgCard, borderColor: colors.border}]}>
              {task.description}
            </Text>
          </View>
        )}

        {/* Edit button */}
        <GradientButton
          label={task.isPasswordRecord ? "✏️ Edit Record" : "✏️ Edit Task"}
          onPress={() => navigation.navigate('AddTask', {task, isPassword: !!task.isPasswordRecord})}
          style={styles.editBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {paddingVertical: 6, paddingRight: 12},
  headerTitle: {fontSize: 18, fontWeight: '700'},
  scroll: {padding: 20, paddingBottom: 40},
  titleRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10, flexWrap: 'wrap'},
  priorityDot: {width: 12, height: 12, borderRadius: 6},
  title: {fontSize: 22, fontWeight: '800', flex: 1},
  doneBadge: {borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1},
  metaGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16},
  metaCard: {width: '47%', borderRadius: 14, padding: 14, borderWidth: 1},
  metaIcon: {fontSize: 20, marginBottom: 4},
  metaLabel: {fontSize: 11, fontWeight: '600', marginBottom: 2},
  metaValue: {fontSize: 14, fontWeight: '700'},
  deadlinePill: {borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 20, alignItems: 'center'},
  deadlineText: {fontWeight: '700', fontSize: 14},
  section: {marginBottom: 20},
  sectionTitle: {fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.4},
  descriptionText: {fontSize: 15, lineHeight: 22, padding: 14, borderRadius: 12, borderWidth: 1},
  editBtn: {marginTop: 8},
});

export default TaskDetailScreen;
