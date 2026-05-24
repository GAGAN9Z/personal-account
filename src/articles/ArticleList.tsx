import React, { memo, useMemo, useCallback } from 'react';
import ArticleCard from './ArticleCard';
import type { ExtendedArticleListProps, FilterType } from '../utils/interfaces';

// добавление функции сравнения
const areEqual = (prevProps: ExtendedArticleListProps, nextProps: ExtendedArticleListProps) => {
  return (
    prevProps.articles.length === nextProps.articles.length &&
    prevProps.activeFilter === nextProps.activeFilter &&
    prevProps.currentUserDocumentId === nextProps.currentUserDocumentId &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onFilterChange === nextProps.onFilterChange
  );
};

const ArticleList: React.FC<ExtendedArticleListProps> = memo(({ 
  articles, 
  onDelete, 
  currentUserDocumentId,
  activeFilter = 'all',
  onFilterChange
}) => {
  
  // стабилизация обработчиков
  const handleFilterChange = useCallback((filter: FilterType) => {
    onFilterChange?.(filter);
  }, [onFilterChange]);
  
  const handleDelete = useCallback((documentId: string) => {
    onDelete(documentId);
  }, [onDelete]);
  
  // мемоизация рендера кнопок фильтров
  const filterButtons = useMemo(() => (
    <div className="feed-filters">
      {(['all', 'my', 'commented'] as const).map((filter) => (
        <button
          key={filter}
          type="button"
          className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
          onClick={() => handleFilterChange(filter)}
        >
          {filter === 'all' && 'Все публикации'}
          {filter === 'my' && 'Мои публикации'}
          {filter === 'commented' && 'Прокомментированные'}
        </button>
      ))}
    </div>
  ), [activeFilter, handleFilterChange]);
  
  // мемоизация рендера списка статей
  const articlesList = useMemo(() => (
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
  ), [articles, handleDelete, currentUserDocumentId]);
  
  if (articles.length === 0) {
    return (
      <section className="posts-feed-full">
        {filterButtons}
        <p className="empty-message">Публикаций пока нет...</p>
      </section>
    );
  }
  
  return (
    <section className="posts-feed-full">
      {filterButtons}
      {articlesList}
    </section>
  );
}, areEqual);

ArticleList.displayName = 'ArticleList';
export default ArticleList;