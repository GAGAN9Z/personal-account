import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../utils/api';
import type { RootState } from './index';
import type { NotesState } from '../utils/interfaces';
import { deleteArticle } from './articlesSlice'; // Импортируем deleteArticle
import { selectUser } from './authSlice';

const initialState: NotesState = {
  items: [],
  loading: false,
  error: null
};

export const fetchNotesByArticle = createAsyncThunk(
  'notes/fetchByArticle',
  async (articleDocumentId: string) => {
    const response = await api.getNotesByArticle(articleDocumentId);
    return { articleId: articleDocumentId, notes: response.data };
  }
);

export const createNote = createAsyncThunk(
  'notes/create',
  async ({ text, article, author }: { text: string; article: string; author: string }, { getState }) => {
    const response = await api.createNote({ text, article, author });
    const state = getState() as RootState;
    const currentUser = selectUser(state);
    
    if (!response.data.author && currentUser) {
      response.data.author = currentUser;
    }
    
    return response.data;
  }
);

export const deleteNote = createAsyncThunk(
  'notes/delete',
  async ({ noteDocumentId, articleDocumentId }: { noteDocumentId: string; articleDocumentId: string }) => {
    await api.deleteNote(noteDocumentId);
    return { noteDocumentId, articleDocumentId };
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearNotesError: (state) => {
      state.error = null;
    },
    clearAllNotes: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotesByArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotesByArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notes;
      })
      .addCase(fetchNotesByArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки комментариев';
      })
      .addCase(createNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка создания комментария';
      })
      .addCase(deleteNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(n => n.documentId !== action.payload.noteDocumentId);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка удаления комментария';
      })
      // При удалении статьи очищаем все комментарии (они перезагрузятся при следующем fetch)
      .addCase(deleteArticle.fulfilled, (state) => {
        state.items = [];
      });
  }
});

export const { clearNotesError, clearAllNotes } = notesSlice.actions;
export const selectNotes = (state: RootState) => state.notes.items;
export const selectNotesLoading = (state: RootState) => state.notes.loading;
export const selectNotesError = (state: RootState) => state.notes.error;

export default notesSlice.reducer;