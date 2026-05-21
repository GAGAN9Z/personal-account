import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../utils/api';
import type { RootState } from './index';
import type { ArticlesState } from '../utils/interfaces';
import { createNote, deleteNote, fetchNotesByArticle } from './notesSlice';

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
    poster?: File | null;
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
      })

      // ОБРАБОТКА СОЗДАНИЯ КОММЕНТАРИЯ ИЗ notesSlice
      .addCase(createNote.fulfilled, (state, action) => {
        const newNote = action.payload;
        // Получаем ID статьи из комментария
        let articleId: string | null = null;
        
        if (typeof newNote.article === 'object' && newNote.article !== null) {
          articleId = (newNote.article as any)?.documentId || null;
        } else if (typeof newNote.article === 'string') {
          articleId = newNote.article;
        } else if (typeof newNote.article === 'number') {
          articleId = String(newNote.article);
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
      
      // ОБРАБОТКА УДАЛЕНИЯ КОММЕНТАРИЯ
      .addCase(deleteNote.fulfilled, (state, action) => {
        const { noteDocumentId, articleDocumentId } = action.payload;
        const articleIndex = state.items.findIndex(a => a.documentId === articleDocumentId);
        if (articleIndex !== -1 && state.items[articleIndex].notes) {
          state.items[articleIndex].notes = state.items[articleIndex].notes!.filter(
            n => n.documentId !== noteDocumentId
          );
        }
      })

      // ЗАГРУЗКА КОММЕНТАРИЕВ - обновляем notes в статье
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

// селекторы
export const selectArticles = (state: RootState) => state.articles.items;
export const selectArticlesLoading = (state: RootState) => state.articles.loading;
export const selectArticlesError = (state: RootState) => state.articles.error;

export default articlesSlice.reducer;