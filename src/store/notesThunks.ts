import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../utils/api';
import type { RootState } from './index';
import { selectUser } from './authSlice';
import type { Note } from '../utils/interfaces';

export const fetchNotesByArticle = createAsyncThunk(
  'notes/fetchByArticle',
  async (articleDocumentId: string, { rejectWithValue }) => {
    try {
      const response = await api.getNotesByArticle(articleDocumentId);
      return { articleId: articleDocumentId, notes: response.data };
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
      return rejectWithValue('Ошибка загрузки комментариев');
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/create',
  async (
    { text, article, author }: { text: string; article: string; author: string }, 
    { getState, rejectWithValue }
  ) => {
    try {
      const response = await api.createNote({ text, article, author });
      const state = getState() as RootState;
      const currentUser = selectUser(state);
      
      const noteData: Note = response.data;
      if (!noteData.author && currentUser) {
        noteData.author = currentUser;
      }
      return noteData;
    } catch (error) {
      console.error('Ошибка создания комментария:', error);
      return rejectWithValue('Ошибка создания комментария');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/delete',
  async (
    { noteDocumentId, articleDocumentId }: { noteDocumentId: string; articleDocumentId: string }, 
    { rejectWithValue }
  ) => {
    try {
      await api.deleteNote(noteDocumentId);
      return { noteDocumentId, articleDocumentId };
    } catch (error) {
      console.error('Ошибка удаления комментария:', error);
      return rejectWithValue('Ошибка удаления комментария');
    }
  }
);