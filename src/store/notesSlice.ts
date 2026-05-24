import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { NotesState } from '../utils/interfaces';
import { fetchNotesByArticle, createNote, deleteNote } from './notesThunks'; // ← импортируем из notesThunks
import { deleteArticle } from './articlesSlice';

const initialState: NotesState = {
  items: [],
  loading: false,
  error: null
};

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
        state.error = action.payload as string || 'Ошибка создания комментария';
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
        state.error = action.payload as string || 'Ошибка удаления комментария';
      })
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