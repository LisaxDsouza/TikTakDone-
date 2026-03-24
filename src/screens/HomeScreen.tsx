// ============================================================
// HomeScreen – Task list with search, filter, sort & stats
// ============================================================
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList, Task} from '../types';
import {TASK_CATEGORIES} from '../constants';
import {useAppDispatch, useAppSelector} from '../hooks/useAppDispatch';
import {
  fetchTasks,
  editTask,
  removeTask,
  setSearchQuery,
  setFilterCategory,
  setFilterStatus,
  clearTasks,
} from '../store/slices/tasksSlice';
import {logout} from '../store/slices/authSlice';
import TaskCard from '../components/TaskCard';
import {smartSort, filterTasks, daysUntilDeadline} from '../utils/helpers';
import {useTheme} from '../hooks/useTheme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Home'>;
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {colors, toggle, isDark} = useTheme();
  const {user} = useAppSelector(s => s.auth);
  const {tasks, filterCategory, filterStatus, searchQuery} =
    useAppSelector(s => s.tasks);
  const [refreshing, setRefreshing] = useState(false);

  // Load tasks on mount
  useEffect(() => {
    if (user) dispatch(fetchTasks(user.id));
  }, [dispatch, user]);

  const handleRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    await dispatch(fetchTasks(user.id));
    setRefreshing(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [dispatch, user]);

  // Apply search + category + status filters, then smart-sort
  const visibleTasks = useCallback(() => {
    // Hidden Password Records from Home
    let filtered = tasks.filter(t => !t.isPasswordRecord);
    
    filtered = filterTasks(filtered, searchQuery);
    if (filterCategory)
      filtered = filtered.filter(t => t.category === filterCategory);
    if (filterStatus === 'active')
      filtered = filtered.filter(t => !t.isCompleted);
    if (filterStatus === 'completed')
      filtered = filtered.filter(t => t.isCompleted);
    return smartSort(filtered);
  }, [tasks, searchQuery, filterCategory, filterStatus]);

  const handleToggleComplete = (task: Task) => {
    if (!user) return;
    dispatch(editTask({userId: user.id, task: {...task, isCompleted: !task.isCompleted}}));
  };

  const handleDelete = (taskId: string) => {
    if (!user) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(removeTask({userId: user.id, taskId}));
  };

  const handleLogout = () => {
    dispatch(clearTasks());
    dispatch(logout());
  };

  // Stats
  const total = tasks.filter(t => !t.isPasswordRecord).length;
  const completed = tasks.filter(t => !t.isPasswordRecord && t.isCompleted).length;
  const active = total - completed;
  const overdueCount = tasks.filter(t => !t.isPasswordRecord && !t.isCompleted && daysUntilDeadline(t.deadline) < 0).length;

  const statusFilters: Array<'all' | 'active' | 'completed'> = [
    'all',
    'active',
    'completed',
  ];

  return (
    <View style={[styles.container, {backgroundColor: colors.bgDark}]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, {color: colors.textPrimary}]}>
            Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </Text>
          <Text style={[styles.subGreeting, {color: colors.textSecondary}]}>
            {active} task{active !== 1 ? 's' : ''} remaining
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggle} style={[styles.iconBtn, {backgroundColor: colors.bgCard, borderColor: colors.border}]}>
            <Text style={{fontSize: 16}}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Vault')} style={[styles.iconBtn, {backgroundColor: colors.bgCard, borderColor: colors.border}]}>
             <Text style={{fontSize: 16}}>🔐</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats bar */}
      <View style={styles.statsRow}>
        {[
          {label: 'Total', value: total, color: colors.primaryLight},
          {label: 'Active', value: active, color: colors.warning},
          {label: 'Done', value: completed, color: colors.success},
        ].map(s => (
          <View key={s.label} style={[styles.statCard, {backgroundColor: colors.bgCard, borderColor: colors.border}]}>
            <Text style={[styles.statValue, {color: s.color}]}>{s.value}</Text>
            <Text style={[styles.statLabel, {color: colors.textMuted}]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, {backgroundColor: colors.bgCard, borderColor: colors.border}]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, {color: colors.textPrimary}]}
          value={searchQuery}
          onChangeText={q => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            dispatch(setSearchQuery(q));
          }}
          placeholder="Search tasks..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Overdue Notification Banner (Simple Notification System) */}
      {overdueCount > 0 && (
        <View style={[styles.overdueBanner, {backgroundColor: colors.error}]}>
          <Text style={styles.overdueText}>⚠️ {overdueCount} task{overdueCount !== 1 ? 's are' : ' is'} OVERDUE!</Text>
        </View>
      )}

      {/* Status filters */}
      <View style={styles.chipRow}>
        {statusFilters.map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.chip, 
              {backgroundColor: colors.bgCard, borderColor: colors.border},
              filterStatus === f && {backgroundColor: colors.primary + '30', borderColor: colors.primary}
            ]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              dispatch(setFilterStatus(f));
            }}>
            <Text
              style={[
                styles.chipText,
                {color: colors.textSecondary},
                filterStatus === f && {color: colors.primaryLight},
              ]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task list */}
      <FlatList
        data={visibleTasks()}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TaskCard
            task={item}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onPress={t => navigation.navigate('TaskDetail', {task: t})}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          total === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={[styles.emptyText, {color: colors.textPrimary}]}>No tasks found</Text>
              <Text style={[styles.emptySubText, {color: colors.textSecondary}]}>
                Tap + below to add your first task
              </Text>
            </View>
          ) : active === 0 ? (
            <View style={[styles.successCard, {backgroundColor: colors.success + '15', borderColor: colors.success + '40'}]}>
               <Text style={styles.successEmoji}>🎉</Text>
               <Text style={[styles.successTitle, {color: colors.success}]}>All Caught Up!</Text>
               <Text style={[styles.successSubtitle, {color: colors.textSecondary}]}>You've completed all your tasks for today. Great job!</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyText, {color: colors.textPrimary}]}>No matches</Text>
              <Text style={[styles.emptySubText, {color: colors.textSecondary}]}>Try a different search term</Text>
            </View>
          )
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: colors.primary, shadowColor: colors.primary}]}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.8}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  greeting: {fontSize: 22, fontWeight: '800'},
  subGreeting: {fontSize: 13, marginTop: 2},
  headerActions: {flexDirection: 'row', alignItems: 'center', gap: 8},
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF444460',
  },
  logoutText: {color: '#EF4444', fontSize: 13, fontWeight: '600'},
  statsRow: {flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 10},
  statCard: {flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1},
  statValue: {fontSize: 24, fontWeight: '800'},
  statLabel: {fontSize: 12, marginTop: 2},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  searchIcon: {fontSize: 16, marginRight: 8},
  searchInput: {flex: 1, fontSize: 14, paddingVertical: 11},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 12},
  chip: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1},
  chipText: {fontSize: 12, fontWeight: '600'},
  list: {paddingHorizontal: 16, paddingBottom: 100},
  empty: {alignItems: 'center', marginTop: 80},
  emptyEmoji: {fontSize: 56, marginBottom: 12},
  emptyText: {fontSize: 18, fontWeight: '700', marginBottom: 4},
  emptySubText: {fontSize: 14},
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  fabText: {color: '#FFF', fontSize: 28, lineHeight: 34},
  overdueBanner: {
    marginHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  overdueText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  successCard: {
    marginTop: 40,
    marginHorizontal: 16,
    padding: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  successEmoji: {fontSize: 50, marginBottom: 12},
  successTitle: {fontSize: 20, fontWeight: '800', marginBottom: 8},
  successSubtitle: {fontSize: 14, textAlign: 'center', lineHeight: 20},
});

export default HomeScreen;
