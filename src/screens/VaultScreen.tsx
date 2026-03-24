import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList, Task} from '../types';
import {useAppDispatch, useAppSelector} from '../hooks/useAppDispatch';
import {fetchTasks, removeTask, setSearchQuery} from '../store/slices/tasksSlice';
import TaskCard from '../components/TaskCard';
import {useTheme} from '../hooks/useTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Vault'>;
};

const VaultScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {colors} = useTheme();
  const {user} = useAppSelector(s => s.auth);
  const {tasks, searchQuery} = useAppSelector(s => s.tasks);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleDelete = (taskId: string) => {
    if (!user) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(removeTask({userId: user.id, taskId}));
  };

  // Only show password records
  const vaultItems = tasks
    .filter(t => t.isPasswordRecord)
    .filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <View style={[styles.container, {backgroundColor: colors.bgDark}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{color: colors.primaryLight, fontSize: 16}}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, {color: colors.textPrimary}]}>🔐 Password Vault</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddTask', {isPassword: true})}
          style={[styles.addBtn, {backgroundColor: colors.secondary}]}>
          <Text style={styles.addBtnText}>＋ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBar, {backgroundColor: colors.bgCard, borderColor: colors.border}]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, {color: colors.textPrimary}]}
          value={searchQuery}
          onChangeText={q => dispatch(setSearchQuery(q))}
          placeholder="Search vault..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <FlatList
        data={vaultItems}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TaskCard
            task={item}
            onToggleComplete={() => {}} // Not used in vault
            onDelete={handleDelete}
            onPress={t => navigation.navigate('AddTask', {task: t, isPassword: true})}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛡️</Text>
            <Text style={[styles.emptyText, {color: colors.textPrimary}]}>Vault is empty</Text>
            <Text style={[styles.emptySubText, {color: colors.textSecondary}]}>Securely store your account passwords here</Text>
          </View>
        }
      />
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
  },
  backBtn: {padding: 4},
  title: {fontSize: 20, fontWeight: '800'},
  addBtn: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8},
  addBtnText: {color: '#FFF', fontWeight: '700', fontSize: 13},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchIcon: {fontSize: 16, marginRight: 8},
  searchInput: {flex: 1, paddingVertical: 10, fontSize: 14},
  list: {paddingHorizontal: 16, paddingBottom: 40},
  empty: {alignItems: 'center', marginTop: 100},
  emptyEmoji: {fontSize: 60, marginBottom: 12},
  emptyText: {fontSize: 18, fontWeight: '700', marginBottom: 4},
  emptySubText: {fontSize: 14, textAlign: 'center', paddingHorizontal: 40},
});

export default VaultScreen;
