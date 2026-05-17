export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  bio?: string; // инфа о себе
  phone?: string; // телефон
  age?: number; // возраст
  avatar?: UserFile; // аватар
}
export interface RegisterResponse {
  jwt: string;
  user: User;
}
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image';
  children: {
    type: 'text';
    text: string;
    bold?: boolean;
    italic?: boolean;
  }[];
}
export interface Article {
  id: number;
  documentId: string;
  title: string;
  content: ContentBlock[];
  image?: UserFile; // добавление картинки
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  author?: User;
  notes?: Note[]; 
}
export interface ArticlesState {
  items: Article[];
  loading: boolean;
  error: string | null;
}
export interface ArticlesResponse {
  data: Article[]; 
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
export interface Note {
  id: number;
  documentId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  author?: User;
  article?: number | Article;
}
export interface NotesResponse {
  data: Note[];
  meta: {
    pagination: {
      total: number;
    };
  };
}
export interface NotesState {
  items: Note[];
  loading: boolean;
  error: string | null;
}
export interface RegisterModalHandle {
  open: () => void;
  close: () => void;
}
export interface UserInfoProps {
  user: User | null;
  onLogout: () => void;
}
export interface CreateArticleProps {
  articleData: {
    title: string;
    content: string;
    poster?: File | null; // добавляем файла для статьи
  };
  setArticleData: React.Dispatch<React.SetStateAction<{
    title: string;
    content: string;
    poster?: File | null;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}
export interface ArticleCardProps {
  article: Article;
  onDelete: (documentId: string) => void;
  currentUserDocumentId?: string | null;
}
export interface ArticleListProps {
  articles: Article[];
  onDelete: (documentId: string) => void;
  currentUserDocumentId?: string | null;
}
export interface ProtectedRouteProps {
  children: React.ReactNode;
}
export interface StatusWrapperProps {
  loading: boolean;
  error: string | null;
  isEmpty?: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}
export interface FormErrors {
  [key: string]: string;
}
export interface UpdateUserPayload {
  username?: string;
  email?: string;
  bio?: string;
  phone?: string;
  age?: number;
  avatar?: number | null;
}
export interface UserFile {
  id: number;
  url: string;
  name: string;
}
export interface EditProfileFormData {
  username: string;
  email: string;
  bio: string;
  phone: string;
  age: number;
}