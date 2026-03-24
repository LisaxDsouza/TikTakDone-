// ============================================================
// TaskCard – displays a single task or password record
// ============================================================
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import {Task} from '../types';
import {formatShortDate, deadlineColor, daysUntilDeadline} from '../utils/helpers';
import {useTheme} from '../hooks/useTheme';

interface Props {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onPress: (task: Task) => void;
}

const TaskCard: React.FC<Props> = ({task, onToggleComplete, onDelete, onPress}) => {
  const {colors} = useTheme();
  const [showPass, setShowPass] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };
  
  const days = daysUntilDeadline(task.deadline ?? '');
  const dColor = deadlineColor(task.deadline ?? '');
  const isUrgent = !task.isCompleted && days <= 1 && !task.isPasswordRecord;

  const handleDelete = () =>
    Alert.alert('Delete Entry', `Delete "${task.title}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(task.id),
      },
    ]);

  const priorityColor = (p: Task['priority']) =>
    p === 'high' ? colors.priorityHigh : p === 'medium' ? colors.priorityMedium : colors.priorityLow;

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[
          styles.card, 
          {backgroundColor: colors.bgCard, borderColor: colors.border},
          task.isCompleted && {opacity: 0.6, borderColor: colors.success + '40'}
        ]}
        onPress={() => onPress(task)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}>
      
      {/* Left: priority stripe (hide for passwords) */}
      {!task.isPasswordRecord && (
        <View style={[styles.priorityStripe, {backgroundColor: priorityColor(task.priority)}]} />
      )}

      {/* Main content */}
      <View style={styles.content}>
        {/* Title row */}
        <View style={styles.row}>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            {task.isPasswordRecord && <Text style={{marginRight: 6}}>🔐</Text>}
            <Text
              style={[
                styles.title, 
                {color: colors.textPrimary},
                task.isCompleted && {textDecorationLine: 'line-through', color: colors.textMuted}
              ]}
              numberOfLines={1}>
              {task.title}
            </Text>
          </View>
          
          {/* Urgency Badge (Simple Notification System) */}
          {isUrgent && (
            <View style={[styles.urgentBadge, {backgroundColor: colors.error}]}>
              <Text style={styles.urgentText}>DUE SOON</Text>
            </View>
          )}

          {/* Category badge */}
          {!isUrgent && (
            <View style={[styles.badge, {backgroundColor: colors.primary + '20'}]}>
              <Text style={[styles.badgeText, {color: colors.primaryLight}]}>{task.category}</Text>
            </View>
          )}
        </View>

        {/* Description / Password */}
        {!!task.description && (
          <View style={styles.descRow}>
            <Text 
              style={[styles.description, {color: colors.textSecondary}]} 
              numberOfLines={task.isPasswordRecord && !showPass ? 1 : 2}>
              {task.isPasswordRecord && !showPass ? '••••••••••••' : task.description}
            </Text>
            {task.isPasswordRecord && (
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.showBtn}>
                <Text style={{fontSize: 12, color: colors.secondary}}>{showPass ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {/* Deadline (hide for passwords) */}
          {!task.isPasswordRecord ? (
            <Text style={[styles.deadline, {color: dColor}]}>
              {days < 0
                ? `Overdue by ${Math.abs(days)}d`
                : days === 0
                ? 'Due today ⚠️'
                : `${days}d left · ${formatShortDate(task.deadline)}`}
            </Text>
          ) : (
             <Text style={[styles.deadline, {color: colors.textMuted}]}>Stored Securely</Text>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            {/* Toggle complete (hide for passwords) */}
            {!task.isPasswordRecord && (
              <TouchableOpacity
                onPress={() => onToggleComplete(task)}
                style={[
                  styles.actionBtn, 
                  {borderColor: colors.border},
                  task.isCompleted && {backgroundColor: colors.success, borderColor: colors.success}
                ]}>
                <Text style={{color: '#FFF', fontWeight: '700'}}>{task.isCompleted ? '✓' : '○'}</Text>
              </TouchableOpacity>
            )}

            {/* Delete */}
            <TouchableOpacity 
              onPress={handleDelete} 
              style={[styles.deleteBtn, {borderColor: colors.error + '60'}]}>
              <Text style={{fontSize: 14}}>🗑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  priorityStripe: {width: 5},
  content: {flex: 1, padding: 14},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4},
  title: {fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8},
  badge: {paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8},
  badgeText: {fontSize: 10, fontWeight: '700'},
  description: {fontSize: 13, marginBottom: 8, lineHeight: 18, flex: 1},
  descRow: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10},
  showBtn: {paddingHorizontal: 6, paddingVertical: 2},
  footer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4},
  deadline: {fontSize: 12, fontWeight: '600'},
  actions: {flexDirection: 'row', gap: 8},
  actionBtn: {width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center'},
  deleteBtn: {width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center'},
  urgentBadge: {paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6},
  urgentText: {color: '#FFF', fontSize: 9, fontWeight: '900'},
});

export default TaskCard;
