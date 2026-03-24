// ============================================================
// AddTaskScreen – Create or edit a task / password record
// ============================================================
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {v4 as uuidv4} from 'uuid';
import dayjs from 'dayjs';
import {MainStackParamList, Priority, Task} from '../types';
import {TASK_CATEGORIES, PRIORITY_LABELS} from '../constants';
import CustomInput from '../components/CustomInput';
import GradientButton from '../components/GradientButton';
import {useAppDispatch, useAppSelector} from '../hooks/useAppDispatch';
import {createTask, editTask} from '../store/slices/tasksSlice';
import {useTheme} from '../hooks/useTheme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'AddTask'>;
  route: RouteProp<MainStackParamList, 'AddTask'>;
};

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

const AddTaskScreen: React.FC<Props> = ({navigation, route}) => {
  const {colors} = useTheme();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(s => s.auth);
  
  const existingTask = route.params?.task;
  const isPasswordMode = route.params?.isPassword || existingTask?.isPasswordRecord;

  // Form state
  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [deadline, setDeadline] = useState(existingTask?.deadline ?? dayjs().add(1, 'day').toISOString());
  const [priority, setPriority] = useState<Priority>(existingTask?.priority ?? 'medium');
  const [category, setCategory] = useState(existingTask?.category ?? (isPasswordMode ? 'Finance' : 'Personal'));
  const [error, setError] = useState('');

  const [dateInput, setDateInput] = useState(dayjs(deadline).format('YYYY-MM-DD'));
  const [timeInput, setTimeInput] = useState(dayjs(deadline).format('HH:mm'));

  useEffect(() => {
    const combined = dayjs(`${dateInput}T${timeInput}`);
    if (combined.isValid()) setDeadline(combined.toISOString());
  }, [dateInput, timeInput]);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setDescription(pass);
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return {label: '', color: 'transparent', width: '0%'};
    let score = 0;
    if (pass.length > 8) score++;
    if (pass.length > 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 2) return {label: 'Weak', color: colors.error, width: '33%'};
    if (score <= 4) return {label: 'Fair', color: colors.warning, width: '66%'};
    return {label: 'Strong', color: colors.success, width: '100%'};
  };

  const strength = isPasswordMode ? getPasswordStrength(description) : null;

  const handleSave = () => {
    if (!title.trim()) return setError(isPasswordMode ? 'Site name is required.' : 'Title is required.');
    if (!isPasswordMode && !dayjs(deadline).isValid()) return setError('Enter a valid deadline.');
    setError('');

    const task: Task = {
      id: existingTask?.id ?? uuidv4(),
      title: title.trim(),
      description: description.trim(),
      deadline: isPasswordMode ? new Date().toISOString() : deadline,
      createdAt: existingTask?.createdAt ?? new Date().toISOString(),
      priority,
      category,
      isCompleted: existingTask?.isCompleted ?? false,
      isPasswordRecord: !!isPasswordMode,
    };

    if (!user) return;
    if (existingTask) {
      dispatch(editTask({userId: user.id, task}));
    } else {
      dispatch(createTask({userId: user.id, task}));
    }
    navigation.goBack();
  };

  const priorityColor = (p: Priority) =>
    p === 'high' ? colors.priorityHigh : p === 'medium' ? colors.priorityMedium : colors.priorityLow;

  return (
    <View style={[styles.container, {backgroundColor: colors.bgDark}]}>
      <View style={[styles.header, {borderBottomColor: colors.border}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{color: colors.primaryLight, fontSize: 16, fontWeight: '600'}}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>
          {isPasswordMode ? (existingTask ? 'Edit Password' : 'New Password Entry') : (existingTask ? 'Edit Task' : 'New Task')}
        </Text>
        <View style={{width: 60}} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <CustomInput
          label={isPasswordMode ? "Site / Account Name" : "Task Title *"}
          value={title}
          onChangeText={setTitle}
          placeholder={isPasswordMode ? "e.g. Gmail / Amazon" : "e.g. Buy groceries"}
        />

        <View style={styles.inputStack}>
          <CustomInput
            label={isPasswordMode ? "Password" : "Description"}
            value={description}
            onChangeText={setDescription}
            placeholder={isPasswordMode ? "••••••••" : "Optional details..."}
            multiline={!isPasswordMode}
            numberOfLines={isPasswordMode ? 1 : 4}
            secureTextEntry={isPasswordMode}
          />
          <TouchableOpacity 
            onPress={generatePassword} 
            style={[styles.genBtn, {backgroundColor: colors.secondary + '20', borderColor: colors.secondary + '60'}]}>
            <Text style={[styles.genBtnText, {color: colors.secondary}]}>🔑 Generate</Text>
          </TouchableOpacity>
        </View>

        {isPasswordMode && strength && description.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={[styles.strengthBar, {backgroundColor: colors.bgInput}]}>
              <View style={[styles.strengthFill, {width: strength.width as any, backgroundColor: strength.color}]} />
            </View>
            <Text style={[styles.strengthLabel, {color: strength.color}]}>{strength.label}</Text>
          </View>
        )}

        {!isPasswordMode && (
          <>
            <CustomInput label="Deadline Date" value={dateInput} onChangeText={setDateInput} placeholder="YYYY-MM-DD" />
            <CustomInput label="Deadline Time" value={timeInput} onChangeText={setTimeInput} placeholder="HH:MM" />
            
            <Text style={[styles.sectionLabel, {color: colors.textSecondary}]}>Priority</Text>
            <View style={styles.optionRow}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.optionBtn, {backgroundColor: colors.bgCard, borderColor: colors.border}, priority === p && {backgroundColor: priorityColor(p) + '25', borderColor: priorityColor(p)}]}
                  onPress={() => setPriority(p)}>
                  <View style={[styles.priorityDot, {backgroundColor: priorityColor(p)}]} />
                  <Text style={[styles.optionText, {color: colors.textSecondary}, priority === p && {color: priorityColor(p)}]}>
                    {PRIORITY_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, {color: colors.textSecondary}]}>Category</Text>
            <View style={styles.optionRow}>
              {TASK_CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.optionBtn, {backgroundColor: colors.bgCard, borderColor: colors.border}, category === c && {backgroundColor: colors.primary + '25', borderColor: colors.primary}]}
                  onPress={() => setCategory(c)}>
                  <Text style={[styles.optionText, {color: colors.textSecondary}, category === c && {color: colors.primaryLight}]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {!!error && (
          <View style={[styles.errorBox, {backgroundColor: colors.error + '20', borderColor: colors.error + '50'}]}>
            <Text style={[styles.errorText, {color: colors.error}]}>⚠️  {error}</Text>
          </View>
        )}

        <GradientButton
          label={existingTask ? 'Update Entry' : 'Create Entry'}
          onPress={handleSave}
          style={styles.saveBtn}
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
  sectionLabel: {fontSize: 13, fontWeight: '600', marginBottom: 10, letterSpacing: 0.4},
  optionRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20},
  optionBtn: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, gap: 6},
  priorityDot: {width: 8, height: 8, borderRadius: 4},
  optionText: {fontSize: 13, fontWeight: '600'},
  errorBox: {borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1},
  errorText: {fontSize: 13},
  saveBtn: {marginTop: 8},
  inputStack: {position: 'relative', marginBottom: 20},
  genBtn: {position: 'absolute', top: 5, right: 0, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1},
  genBtnText: {fontSize: 11, fontWeight: '700'},
  strengthContainer: {flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10},
  strengthBar: {flex: 1, height: 6, borderRadius: 3, overflow: 'hidden'},
  strengthFill: {height: '100%'},
  strengthLabel: {fontSize: 12, fontWeight: '700', width: 50},
});

export default AddTaskScreen;
