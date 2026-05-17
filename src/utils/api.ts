import axios from 'axios';
import type { RegisterResponse, ArticlesResponse, Article, User, Note, NotesResponse, UpdateUserPayload, UserFile} from './interfaces';

const API_URL = 'http://localhost:1337/api';
const $api = axios.create({ baseURL: API_URL });

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // авторизация
  async register(formData: Record<string, string>): Promise<RegisterResponse> {
    const { data } = await $api.post<RegisterResponse>('/auth/local/register', formData);
    return data;
  },

  async login(formData: Record<string, string>): Promise<RegisterResponse> {
    const { data } = await $api.post<RegisterResponse>('/auth/local', {
      identifier: formData.email,
      password: formData.password
    });
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await $api.get<User>('/users/me?populate=*');
    return data;
  },

  // пользователи
  async updateUser(userId: number, updateData: UpdateUserPayload): Promise<User> {
    const { data } = await $api.put<User>(`/users/${userId}`, updateData);
    return data;
  },

  // статьи
  async getArticles(): Promise<ArticlesResponse> {
  const { data } = await $api.get<ArticlesResponse>(
    '/articles?populate[author]=true&populate[image]=true&populate[notes][populate][author]=true&sort=createdAt:desc'
  );
  return data;
},

  async getArticlesByAuthor(authorDocumentId: string): Promise<ArticlesResponse> {
    const { data } = await $api.get<ArticlesResponse>(
      `/articles?filters[author][documentId][$eq]=${authorDocumentId}&populate=*&sort=createdAt:desc`
    );
    return data;
  },

  async getCommentedArticles(userDocumentId: string): Promise<ArticlesResponse> {
    const { data } = await $api.get<ArticlesResponse>(
      `/articles?filters[notes][author][documentId][$eq]=${userDocumentId}&populate=*&sort=createdAt:desc`
    );
    return data;
  },

  async getArticleById(documentId: string): Promise<{ data: Article }> {
    const { data } = await $api.get<{ data: Article }>(`/articles/${documentId}?populate=*`);
    return data;
  },

  // api.ts
  async createArticle(articleData: { 
    title: string; 
    content: string; 
    author: string;
    poster?: File | null;
  }): Promise<{ data: Article }> {
  
  let imageId = null;
  
  if (articleData.poster) {
    const uploadedFiles = await this.uploadFile(articleData.poster);
    if (uploadedFiles && uploadedFiles[0]) {
      imageId = uploadedFiles[0].id;
    }
  }
  
  // создаем статью с картинкой (если есть)
  const { data } = await $api.post<{ data: Article }>('/articles', {
    data: {
      title: articleData.title,
      content: [
        { type: 'paragraph', children: [{ type: 'text', text: articleData.content }] }
      ],
      author: articleData.author,
      image: imageId
    }
  });
  return data;
  },

  async updateArticle(documentId: string, articleData: { title: string; content: string }): Promise<{ data: Article }> {
    const { data } = await $api.put<{ data: Article }>(`/articles/${documentId}`, {
      data: {
        title: articleData.title,
        content: [
          { 
            type: 'paragraph',
            children: [{ type: 'text', text: articleData.content }] 
          }
        ]
      }
    });
    return data;
  },

  async deleteArticle(documentId: string): Promise<boolean> {
    await $api.delete(`/articles/${documentId}`);
    return true;
  },

  // комменты
  async getNotesByArticle(articleDocumentId: string): Promise<NotesResponse> {
    const { data } = await $api.get<NotesResponse>(
      `/notes?filters[article][documentId][$eq]=${articleDocumentId}&populate=*&sort=createdAt:desc`
    );
    return data;
  },

  async createNote(noteData: { text: string; article: string; author: string }): Promise<{ data: Note }> {
    const { data } = await $api.post<{ data: Note }>('/notes', {
      data: {
        text: noteData.text,
        article: noteData.article,
        author: noteData.author
      }
    });
    return data;
  },

  async deleteNote(documentId: string): Promise<boolean> {
    await $api.delete(`/notes/${documentId}`);
    return true;
  },

  // загрузка файлов
  async uploadFile(file: File): Promise<UserFile[]> {
    const token = localStorage.getItem('jwt');
    const formData = new FormData();
    formData.append('files', file);
  
    const { data } = await axios.post<UserFile[]>(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return data;
  },

  async getMeWithAvatar(): Promise<User> {
    const { data } = await $api.get<User>('/users/me?populate[avatar]=*');
    return data;
  },
};