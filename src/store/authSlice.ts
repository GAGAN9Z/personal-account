import { createSlice, createAsyncThunk, type PayloadAction, isAnyOf } from '@reduxjs/toolkit';
import axios from 'axios';
import { api } from '../utils/api';
import type { RootState, AppDispatch } from '../store';
import type { User, RegisterResponse, AuthState, UpdateUserPayload } from '../utils/interfaces';

const saveAuthData = (jwt: string, user: User) => {
  localStorage.setItem('jwt', jwt);
  localStorage.setItem('user', JSON.stringify(user));
};

const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error?.message || 'Ошибка сервера';
  }
  if (err instanceof Error) return err.message;
  return 'Произошла неизвестная ошибка';
};

export const registerUser = createAsyncThunk<RegisterResponse, Record<string, string>, {
rejectValue: string }>(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await api.register(formData);
      saveAuthData(data.jwt, data.user);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const loginUser = createAsyncThunk<RegisterResponse, Record<string, string>, {
  rejectValue: string,
  dispatch: AppDispatch
}>(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await api.login(formData);
      
      // Сначала сохраняем базовые данные
      saveAuthData(data.jwt, data.user);
      
      // Затем загружаем полные данные с аватаром
      try {
        const userWithAvatar = await api.getMeWithAvatar();
        const jwt = localStorage.getItem('jwt');
        if (jwt) {
          localStorage.setItem('user', JSON.stringify(userWithAvatar));
        }
        return { jwt: data.jwt, user: userWithAvatar };
      } catch (avatarError) {
        // Если не удалось загрузить аватар, возвращаем базовые данные
        console.warn('Failed to load avatar:', avatarError);
        return data;
      }
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);
export const fetchUserWithAvatar = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const user = await api.getMeWithAvatar();
      const jwt = localStorage.getItem('jwt');
      if (jwt){
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateUserProfile = createAsyncThunk<User, UpdateUserPayload, { rejectValue: string }>(
  'auth/updateProfile',
  async (updateData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.id;
      
      if (!userId) {
        return rejectWithValue('Пользователь не найден');
      }
      
      // обновление пользователя
      await api.updateUser(userId, updateData);
      
      // получение обновленного пользователя с авой
      const updatedUser = await api.getMeWithAvatar();
      
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const changeAvatar = createAsyncThunk<User, File, { rejectValue: string }>(
  'auth/changeAvatar',
  async (file, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.id;
      
      if (!userId) {
        return rejectWithValue('Пользователь не найден');
      }
      
      // загрузка файла на сервер
      const uploadedFiles = await api.uploadFile(file);
      const uploadedFile = uploadedFiles[0];
      
      if (!uploadedFile) {
        return rejectWithValue('Не удалось загрузить файл');
      }
      
      // обновление профиля, передаём ID загруженного файла
      await api.updateUser(userId, { avatar: uploadedFile.id });
      
      // получние обновленного пользователя
      const updatedUser = await api.getMeWithAvatar();
      
      // обновление localStorage
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const getSavedUser = (): User | null => {
  try {
    const saved = localStorage.getItem('user');
    if (!saved) return null;
    const user = JSON.parse(saved);
    return user;
  } catch { return null; }
};

const initialState: AuthState = {
  user: getSavedUser(),
  token: localStorage.getItem('jwt'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // pending для всех экшенов
      .addMatcher(
        isAnyOf(registerUser.pending, loginUser.pending, updateUserProfile.pending, changeAvatar.pending), 
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // fulfilled для register и login
      .addMatcher(
        isAnyOf(registerUser.fulfilled, loginUser.fulfilled), 
        (state, action: PayloadAction<RegisterResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.jwt;
        }
      )
      // fulfilled для updateUserProfile
      .addMatcher(
        isAnyOf(updateUserProfile.fulfilled), 
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.user = action.payload;
        }
      )
      // fulfilled для changeAvatar
      .addMatcher(
        isAnyOf(changeAvatar.fulfilled), 
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.user = action.payload;
        }
      )
      // rejected для всех
      .addMatcher(
        isAnyOf(registerUser.rejected, loginUser.rejected, updateUserProfile.rejected, changeAvatar.rejected), 
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string || 'Ошибка';
        }
      );
  },
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuth = (state: RootState) => !!state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;