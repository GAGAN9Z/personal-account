import React, { memo, useCallback } from 'react';
import ArticleCard from './ArticleCard';
import type { ArticleListProps } from '../utils/interfaces';

interface ExtendedArticleListProps extends ArticleListProps {
  activeFilter?: 'all' | 'my' | 'commented';
  onFilterChange?: (filter: 'all' | 'my' | 'commented') => void;
}

const ArticleList: React.FC<ExtendedArticleListProps> = memo(({ 
  articles, 
  onDelete, 
  currentUserDocumentId,
  activeFilter = 'all',
  onFilterChange
}) => {
  
  const handleFilterChange = useCallback((filter: 'all' | 'my' | 'commented') => {
    onFilterChange?.(filter);
  }, [onFilterChange]);
  
  // Стабилизируем onDelete для каждой статьи
  const handleDelete = useCallback((documentId: string) => {
    onDelete(documentId);
  }, [onDelete]);
  
  if (articles.length === 0) {
    return (
      <section className="posts-feed-full">
        <div className="feed-filters">
          <button 
            type="button" 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >Все публикации</button>
          <button 
            type="button" 
            className={`filter-btn ${activeFilter === 'my' ? 'active' : ''}`}
            onClick={() => handleFilterChange('my')}
          >Мои публикации</button>
          <button 
            type="button" 
            className={`filter-btn ${activeFilter === 'commented' ? 'active' : ''}`}
            onClick={() => handleFilterChange('commented')}
          >Прокомментированные</button>
        </div>
        <p className="empty-message">Публикаций пока нет...</p>
      </section>
    );
  }
  
  return (
    <section className="posts-feed-full">
      <div className="feed-filters">
        <button 
          type="button" 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >Все публикации</button>
        <button 
          type="button" 
          className={`filter-btn ${activeFilter === 'my' ? 'active' : ''}`}
          onClick={() => handleFilterChange('my')}
        >Мои публикации</button>
        <button 
          type="button" 
          className={`filter-btn ${activeFilter === 'commented' ? 'active' : ''}`}
          onClick={() => handleFilterChange('commented')}
        >Прокомментированные</button>
      </div>
      <ul className="feed-list">
        {articles.map((article) => (
          <li key={article.documentId} className="feed-item">
            <ArticleCard
              article={article}
              onDelete={handleDelete}
              currentUserDocumentId={currentUserDocumentId} 
            />
          </li>
        ))}
      </ul>
    </section>
  );
});

ArticleList.displayName = 'ArticleList';
export default ArticleList;