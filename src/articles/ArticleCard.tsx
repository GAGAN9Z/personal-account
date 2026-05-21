import React, { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store';
import { createNote, deleteNote, fetchNotesByArticle, selectNotesLoading } from '../store/notesSlice';
import { validateComment } from '../utils/validators';
import type { ArticleCardProps, Note } from '../utils/interfaces';

const API_BASE_URL = 'http://localhost:1337';

const ArticleCard: React.FC<ArticleCardProps> = memo(({ article, onDelete, currentUserDocumentId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);
  
  // Получаем статусы загрузки
  const notesLoading = useSelector(selectNotesLoading);
  
  // Локальное состояние для комментариев этой статьи - всегда массив
  const [localNotes, setLocalNotes] = useState<Note[]>(article.notes || []);
  
  // Обновляем локальные комментарии когда article обновляется (например, после перезагрузки страницы)
  useEffect(() => {
    if (article.notes) {
      setLocalNotes(article.notes);
      setHasLoadedComments(true);
    }
  }, [article.notes]);

  // Загружаем комментарии при открытии (только один раз)
  useEffect(() => {
    if (showComments && !hasLoadedComments && !notesLoading) {
      dispatch(fetchNotesByArticle(article.documentId)).then((action) => {
        if (fetchNotesByArticle.fulfilled.match(action)) {
          setLocalNotes(action.payload.notes);
          setHasLoadedComments(true);
        }
      });
    }
  }, [showComments, article.documentId, dispatch, hasLoadedComments, notesLoading]);

  if (!article) return null;

  const contentText = useMemo(() => {
    return article.content?.[0]?.children?.[0]?.text || "Пустая публикация";
  }, [article.content]);

  const formattedDate = useMemo(() => {
    return new Date(article.createdAt).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [article.createdAt]);

  const isAuthor = currentUserDocumentId === article.author?.documentId;
  const imageUrl = article.image?.url ? `${API_BASE_URL}${article.image.url}` : null;
  
  // Счетчик берем из локальных комментариев (они всегда актуальны)
  const commentsCount = localNotes.length;

  const handleToggleComments = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
    if (commentError) setCommentError(null);
  }, [commentError]);

  const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateComment({ text: commentText });
    if (Object.keys(validationErrors).length > 0) {
      setCommentError(validationErrors.text || 'Ошибка валидации');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await dispatch(createNote({
        text: commentText,
        article: article.documentId,
        author: currentUserDocumentId || ''
      })).unwrap();
      
      // Добавляем новый комментарий в локальное состояние - счетчик обновится мгновенно
      setLocalNotes(prev => [result, ...prev]);
      setCommentText('');
      setCommentError(null);
    } catch (err) {
      setCommentError('Ошибка при отправке комментария');
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, commentText, article.documentId, currentUserDocumentId]);

  const handleDeleteComment = useCallback(async (noteDocumentId: string) => {
    if (!window.confirm('Удалить комментарий?')) return;
    try {
      await dispatch(deleteNote({ noteDocumentId, articleDocumentId: article.documentId })).unwrap();
      // Удаляем комментарий из локального состояния - счетчик обновится мгновенно
      setLocalNotes(prev => prev.filter(n => n.documentId !== noteDocumentId));
    } catch (err) {
      console.error('Ошибка удаления комментария:', err);
    }
  }, [dispatch, article.documentId]);

  const handleDeleteArticle = useCallback(() => {
    onDelete(article.documentId);
  }, [onDelete, article.documentId]);

  return (
    <article className="post-card">
      <header className="post-header">
        <h4 className="post-title">{article.title || "Без заголовка"}</h4>
        <time className="post-date" dateTime={article.createdAt}>
          {formattedDate}
        </time>
      </header>
      
      {imageUrl && (
        <div className="post-poster">
          <img
            src={imageUrl}
            alt={`Изображение к статье: ${article.title}`}
            className="poster-image"
          />
        </div>
      )}
      
      <p className="post-content">{contentText}</p>
      
      <footer className="post-footer">
        <div className="post-stats">
          <span
            className="comment-display"
            onClick={handleToggleComments}
            style={{ cursor: 'pointer' }}
          >
            {commentsCount} комментариев
          </span>
        </div>
        <div className="post-actions">
          <button
            className="link-btn post-action"
            onClick={handleToggleComments}
          >
            {showComments ? 'Скрыть' : 'Комментарии'}
          </button>
          {isAuthor && (
            <button
              type="button"
              onClick={handleDeleteArticle}
              className="link-btn danger"
              aria-label="Удалить публикацию"
            >
              Удалить
            </button>
          )}
        </div>
      </footer>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleSubmitComment} className="comment-form">
            <div className="form-group">
              <textarea
                placeholder="Написать комментарий..."
                value={commentText}
                onChange={handleCommentChange}
                disabled={isSubmitting}
                rows={3}
              />
              {commentError && <p className="form-error">{commentError}</p>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </form>

          <div className="comments-list">
            <h5>Комментарии:</h5>
            {localNotes.length === 0 && !notesLoading ? (
              <p>Нет комментариев. Будьте первым!</p>
            ) : (
              localNotes.map((note) => (
                <div key={note.documentId} className="comment-item">
                  <div className="comment-header">
                    <strong>{note.author?.username || 'Пользователь'}</strong>
                    <small>{new Date(note.createdAt).toLocaleString('ru-RU')}</small>
                  </div>
                  <p className="comment-text">{note.text}</p>
                  {currentUserDocumentId === note.author?.documentId && (
                    <button
                      onClick={() => handleDeleteComment(note.documentId)}
                      className="link-btn danger"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
});

ArticleCard.displayName = 'ArticleCard';
export default ArticleCard;