// ============================================================
// Redux slice for tasks state
// ============================================================
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Task} from '../../types';
import * as taskService from '../../services/taskService';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filterCategory: string;     // '' = all
  filterStatus: 'all' | 'active' | 'completed';
  searchQuery: string;
}

const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
  filterCategory: '',
  filterStatus: 'all',
  searchQuery: '',
};

// ─── Async thunks ──────────────────────────────────────────

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string) => taskService.getTasks(userId),
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({userId, task}: {userId: string; task: Task}) =>
    taskService.addTask(userId, task),
);

export const editTask = createAsyncThunk(
  'tasks/editTask',
  async ({userId, task}: {userId: string; task: Task}) =>
    taskService.updateTask(userId, task),
);

export const removeTask = createAsyncThunk(
  'tasks/removeTask',
  async ({userId, taskId}: {userId: string; taskId: string}) =>
    taskService.deleteTask(userId, taskId),
);

// ─── Slice ──────────────────────────────────────────────────

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilterCategory(state, action: PayloadAction<string>) {
      state.filterCategory = action.payload;
    },
    setFilterStatus(
      state,
      action: PayloadAction<'all' | 'active' | 'completed'>,
    ) {
      state.filterStatus = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearTasks(state) {
      state.tasks = [];
    },
  },
  extraReducers: builder => {
    // fetchTasks
    builder
      .addCase(fetchTasks.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, state => {
        state.isLoading = false;
      })
      // createTask
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
      })
      // editTask
      .addCase(editTask.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
      })
      // removeTask
      .addCase(removeTask.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
      });
  },
});

export const {
  setFilterCategory,
  setFilterStatus,
  setSearchQuery,
  clearTasks,
} = tasksSlice.actions;
export default tasksSlice.reducer;
