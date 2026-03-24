// ============================================================
// Redux slice for authentication state
// ============================================================
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {User, AuthCredentials} from '../../types';
import * as authService from '../../services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  theme: 'dark' | 'light';
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  theme: 'dark', // Default
};

// ─── Async thunks ──────────────────────────────────────────

/** Restore session from AsyncStorage on app start */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async () => authService.getSession(),
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: AuthCredentials, {rejectWithValue}) => {
    try {
      const user = await authService.registerUser(credentials);
      return user; // Just return user object to indicate success
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/** Login an existing user */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: AuthCredentials, {rejectWithValue}) => {
    try {
      const user = await authService.loginUser(credentials);
      await authService.saveSession(user);
      return user;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/** Logout and clear persisted session */
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.clearSession();
});

// ─── Slice ──────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
  },
  extraReducers: builder => {
    // restoreSession
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // register
      .addCase(register.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        // Do NOT set user here to force manual login
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // login
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // logout
      .addCase(logout.fulfilled, state => {
        state.user = null;
      });
  },
});

export const {clearError, toggleTheme} = authSlice.actions;
export default authSlice.reducer;
