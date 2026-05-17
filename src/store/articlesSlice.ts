import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../utils/api';
import type { RootState } from './index';
import type { ArticlesState } from '../utils/interfaces';
import { createNote, deleteNote } from './notesSlice';

const initialState: ArticlesState = {
  items: [],
  loading: false,
  error: null
};

// асинхронные действия
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
    poster?: File | null;  // опциональная картинка
  }) => {
    const response = await api.createArticle({ title, content, author, poster });
    return response.data;
  }
);

export const deleteArticle = createAsyncThunk(
  'articles/delete',
  async (documentId: string) => {
    await api.deleteArticle(documentId);
    return documentId;
  }
);

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
      // создание коммента
      .addCase(createNote.fulfilled, (state, action) => {
        const newNote = action.payload;
        // получние documentId статьи из комментария
        const articleId = typeof newNote.article === 'object'
          ? (newNote.article as any)?.documentId
          : newNote.article;
        
        const article = state.items.find(a => a.documentId === articleId);
        if (article) {
          if (!article.notes) article.notes = [];
          article.notes.unshift(newNote);
        }
      })
      
      // удаление коммента
      .addCase(deleteNote.fulfilled, (state, action) => {
        const { noteDocumentId, articleDocumentId } = action.payload;
        const article = state.items.find(a => a.documentId === articleDocumentId);
        if (article && article.notes) {
          article.notes = article.notes.filter(n => n.documentId !== noteDocumentId);
        }
      })
      
      // извлечение всех статей
      .addCase(fetchAllArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки статей';
      })
      
      // извлечение статей пользователя
      .addCase(fetchMyArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки статей';
      })
      
      // извлечение прокомментированных статей
      .addCase(fetchCommentedArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentedArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCommentedArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки статей';
      })
      
      // создание статьи
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка создания статьи';
      })
      
      // удаление статьи
      .addCase(deleteArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(a => a.documentId !== action.payload);
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка удаления статьи';
      });
  }
});

export const { clearArticlesError } = articlesSlice.actions;

// селекторы
export const selectArticles = (state: RootState) => state.articles.items;
export const selectArticlesLoading = (state: RootState) => state.articles.loading;
export const selectArticlesError = (state: RootState) => state.articles.error;

export default articlesSlice.reducer;