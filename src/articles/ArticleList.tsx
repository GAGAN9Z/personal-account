import React, { memo } from 'react';
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
  
  if (articles.length === 0) {
    return (
      <section className="posts-feed-full">
        <div className="feed-filters">
          <button 
            type="button" 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange?.('all')}
          >Все публикации</button>
          <button 
            type="button" 
            className={`filter-btn ${activeFilter === 'my' ? 'active' : ''}`}
            onClick={() => onFilterChange?.('my')}
          >Мои публикации</button>
          <button 
            type="button" 
            className={`filter-btn ${activeFilter === 'commented' ? 'active' : ''}`}
            onClick={() => onFilterChange?.('commented')}
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
          onClick={() => onFilterChange?.('all')}
        >Все публикации</button>
        <button 
          type="button" 
          className={`filter-btn ${activeFilter === 'my' ? 'active' : ''}`}
          onClick={() => onFilterChange?.('my')}
        >Мои публикации</button>
        <button 
          type="button" 
          className={`filter-btn ${activeFilter === 'commented' ? 'active' : ''}`}
          onClick={() => onFilterChange?.('commented')}
        >Прокомментированные</button>
      </div>
      <ul className="feed-list">
        {articles.map((article) => (
          <li key={article.documentId} className="feed-item">
            <ArticleCard
              article={article}
              onDelete={onDelete}
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