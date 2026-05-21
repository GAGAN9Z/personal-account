import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../store';
import { logout, selectUser, selectIsAuth } from '../store/authSlice';
import { fetchAllArticles, fetchMyArticles, fetchCommentedArticles, createArticle, deleteArticle, selectArticles, selectArticlesLoading, selectArticlesError } from '../store/articlesSlice';
import UserInfo from '../components/profile/UserInfo';
import CreateArticle from '../articles/CreateArticle';
import ArticleList from '../articles/ArticleList';
import StatusWrapper from './hoc/StatusWrapper';

type FilterType = 'all' | 'my' | 'commented';

// создание типа для формы создания статьи
interface ArticleFormData {
  title: string;
  content: string;
  poster?: File | null;
}

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [articleData, setArticleData] = useState<ArticleFormData>({ 
    title: '',
    content: '',
    poster: null
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(selectUser);
  const articles = useSelector(selectArticles);
  const articlesLoading = useSelector(selectArticlesLoading);
  const articlesError = useSelector(selectArticlesError);
  
  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
    }
  }, [isAuth, navigate]);
  
  const loadArticles = useCallback(() => {
    if (!user?.documentId) return;
    
    switch (activeFilter) {
      case 'my':
        dispatch(fetchMyArticles(user.documentId));
        break;
      case 'commented':
        dispatch(fetchCommentedArticles(user.documentId));
        break;
      default:
        dispatch(fetchAllArticles());
    }
  }, [dispatch, activeFilter, user?.documentId]);
  
  useEffect(() => {
    if (isAuth && user?.documentId) {
      loadArticles();
    }
  }, [isAuth, user?.documentId, activeFilter, loadArticles]);
  
  // УДАЛЕН useEffect с запросом /users/me - эта логика должна быть в authSlice
  
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);
  
  const handleCreateArticle = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.documentId || !isAuth) return;
    
    setIsPublishing(true);
    try {
      await dispatch(createArticle({
        title: articleData.title,
        content: articleData.content,
        author: user.documentId,
        poster: articleData.poster
      })).unwrap();
      
      // Сброс формы
      setArticleData({ title: '', content: '', poster: null });
      loadArticles();
    } catch (err) {
      alert("Ошибка при публикации");
    } finally {
      setIsPublishing(false);
    }
  }, [dispatch, user, isAuth, articleData, loadArticles]);
  
  const handleDeleteArticle = useCallback(async (documentId: string) => {
    if (!isAuth || !documentId) return;
    if (!window.confirm("Вы уверены, что хотите удалить эту статью?")) return;
    
    try {
      await dispatch(deleteArticle(documentId)).unwrap();
      loadArticles();
    } catch (err) {
      console.error("Ошибка удаления:", err);
      alert("Не удалось удалить статью на сервере");
    }
  }, [dispatch, isAuth, loadArticles]);
  
  if (!user) return null;
  
  return (
    <main className="dashboard-grid">
      <UserInfo user={user} onLogout={handleLogout} />
      
      <CreateArticle
        articleData={articleData}
        setArticleData={setArticleData}
        onSubmit={handleCreateArticle}
        isLoading={isPublishing}
      />
      
      <StatusWrapper
        loading={articlesLoading}
        error={articlesError}
      >
        <ArticleList
          articles={articles}
          onDelete={handleDeleteArticle}
          currentUserDocumentId={user?.documentId}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </StatusWrapper>
    </main>
  );
};

export default Profile;