import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import articlesReducer from './articlesSlice';
import notesReducer from './notesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    articles: articlesReducer,
    notes: notesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;