import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../utils/api';
import type { RootState } from './index';
import type { ArticlesState } from '../utils/interfaces';
import { createNote, deleteNote, fetchNotesByArticle } from './notesThunks';

const initialState: ArticlesState = {
  items: [],
  loading: false,
  error: null
};

// Асинхронные действия
export const fetchAllArticles = createAsyncThunk(
  'articles/fetchAll',
  async () => {
    const response = await api.getArticles();
    return response.data;
  }
);

export const fetchMyArticles = createAsyncThunk(
  'articles/fetchMy',
  async (authorDocumentId: string) => {
    const response = await api.getArticlesByAuthor(authorDocumentId);
    return response.data;
  }
);

export const fetchCommentedArticles = createAsyncThunk(
  'articles/fetchCommented',
  async (userDocumentId: string) => {
    const response = await api.getCommentedArticles(userDocumentId);
    return response.data;
  }
);

export const createArticle = createAsyncThunk(
  'articles/create',
  async ({ title, content, author, poster }: {
    title: string;
    content: string;
    author: string;
    poster?: File | null;
  }) => {
    const response = await api.createArticle({ title, content, author, poster });
    return response.data;
  }
);

export const deleteArticle = createAsyncThunk(
  'articles/delete',
  async (documentId: string) => {
    const articleResponse = await api.getArticleById(documentId);
    const article = articleResponse.data;
    if (article.notes && article.notes.length > 0) {
      for (const note of article.notes) {
        await api.deleteNote(note.documentId);
      }
    }
    await api.deleteArticle(documentId);
    return documentId;
  }
);

// вспомогательная функция для обработки pending
const handlePending = (state: ArticlesState) => {
  state.loading = true;
  state.error = null;
};

// вспомогательная функция для обработки rejected
const handleRejected = (state: ArticlesState, action: { error?: { message?: string } }) => {
  state.loading = false;
  state.error = action.error?.message || 'Ошибка';
};

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    clearArticlesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllArticles
      .addCase(fetchAllArticles.pending, handlePending)
      .addCase(fetchAllArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllArticles.rejected, handleRejected)
      
      // fetchMyArticles
      .addCase(fetchMyArticles.pending, handlePending)
      .addCase(fetchMyArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyArticles.rejected, handleRejected)
      
      // fetchCommentedArticles
      .addCase(fetchCommentedArticles.pending, handlePending)
      .addCase(fetchCommentedArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCommentedArticles.rejected, handleRejected)
      
      // createArticle
      .addCase(createArticle.pending, handlePending)
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createArticle.rejected, handleRejected)
      
      // deleteArticle
      .addCase(deleteArticle.pending, handlePending)
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(a => a.documentId !== action.payload);
      })
      .addCase(deleteArticle.rejected, handleRejected)

      // обработка создания комментария
      .addCase(createNote.fulfilled, (state, action) => {
        const newNote = action.payload;
        
        let articleId: string | null = null;
        
        if (newNote.article && typeof newNote.article === 'object' && 'documentId' in newNote.article) {
          articleId = newNote.article.documentId;
        } else if (typeof newNote.article === 'string') {
          articleId = newNote.article;
        }
        
        if (articleId) {
          const articleIndex = state.items.findIndex(a => a.documentId === articleId);
          if (articleIndex !== -1) {
            const article = state.items[articleIndex];
            const updatedNotes = article.notes ? [newNote, ...article.notes] : [newNote];
            state.items[articleIndex] = { ...article, notes: updatedNotes };
          }
        }
      })
      
      // обработка удаления комментария
      .addCase(deleteNote.fulfilled, (state, action) => {
        const { noteDocumentId, articleDocumentId } = action.payload;
        const articleIndex = state.items.findIndex(a => a.documentId === articleDocumentId);
        if (articleIndex !== -1 && state.items[articleIndex].notes) {
          state.items[articleIndex].notes = state.items[articleIndex].notes!.filter(
            n => n.documentId !== noteDocumentId
          );
        }
      })

      // загрузка комментариев
      .addCase(fetchNotesByArticle.fulfilled, (state, action) => {
        const { articleId, notes } = action.payload;
        const articleIndex = state.items.findIndex(a => a.documentId === articleId);
        if (articleIndex !== -1) {
          state.items[articleIndex] = { ...state.items[articleIndex], notes };
        }
      });
  }
});

export const { clearArticlesError } = articlesSlice.actions;

export const selectArticles = (state: RootState) => state.articles.items;
export const selectArticlesLoading = (state: RootState) => state.articles.loading;
export const selectArticlesError = (state: RootState) => state.articles.error;

export default articlesSlice.reducer;