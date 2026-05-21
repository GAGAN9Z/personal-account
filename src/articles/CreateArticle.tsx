import React, { memo, useState, useCallback, useRef } from 'react';
import type { CreateArticleProps } from '../utils/interfaces';
import { validateArticle, type FormErrors } from '../utils/validators';

const CreateArticle: React.FC<CreateArticleProps & { isLoading?: boolean }> = memo(({
  articleData,
  setArticleData,
  onSubmit,
  isLoading = false
}) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((field: 'title' | 'content', value: string) => {
    const newData = { ...articleData, [field]: value };
    setArticleData(newData);
    
    const validationErrors = validateArticle(newData);
    setErrors(validationErrors);
  }, [articleData, setArticleData]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // валидация файла
    const validationErrors = validateArticle({ ...articleData, poster: file });
    if (validationErrors.poster) {
      setErrors(prev => ({ ...prev, poster: validationErrors.poster as string }));
      return;
    }
    
    // создаем превью
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // сохраняем файл в состояние
    setArticleData({ ...articleData, poster: file });
    // удаляем ошибку poster из состояния
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.poster;
      return newErrors;
    });
  }, [articleData, setArticleData]);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setArticleData({ ...articleData, poster: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // удаляем ошибку poster из состояния
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.poster;
      return newErrors;
    });
  }, [articleData, setArticleData]);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateArticle(articleData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ title: true, content: true, poster: true });
      return;
    }
    
    onSubmit(e);
    
    if (Object.keys(validationErrors).length === 0) {
        setErrors({});
        setTouched({});
    }
  }, [articleData, onSubmit, setArticleData]);

  return (
    <section className="card-base create-post" aria-labelledby="create-post-title">
      <h3 id="create-post-title" className="create-post-title">Создать публикацию</h3> 
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title">Заголовок</label>
          <input
            id="post-title"
            type="text"
            placeholder="Заголовок публикации"
            value={articleData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            disabled={isLoading}
            className={touched.title && errors.title ? 'error' : ''}
            required
          />
          {touched.title && errors.title && (
            <p className="form-error">{errors.title}</p>
          )}
        </div>
        
        {/* поле для загрузки изображения */}
        <div className="form-group">
          <label htmlFor="post-poster">Изображение публикации (опционально)</label>
          <div className="poster-upload">
            <input
              ref={fileInputRef}
              id="post-poster"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              disabled={isLoading}
              className={touched.poster && errors.poster ? 'error' : ''}
            />
            {imagePreview && (
              <div className="poster-preview">
                <img src={imagePreview} alt="Предпросмотр" />
                <button 
                  type="button" 
                  className="link-btn danger" 
                  onClick={handleRemoveImage}
                >
                  Удалить изображение
                </button>
              </div>
            )}
          </div>
          {touched.poster && errors.poster && (
            <p className="form-error">{errors.poster}</p>
          )}
          <small className="form-hint">Поддерживаются JPEG, PNG, WEBP, GIF. Максимум 5MB</small>
        </div>
        
        <div className="form-group flex-grow">
          <label htmlFor="post-content">Контент</label>
          <textarea
            id="post-content"
            placeholder="О чем вы хотите рассказать?"
            value={articleData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            onBlur={() => handleBlur('content')}
            disabled={isLoading}
            className={touched.content && errors.content ? 'error' : ''}
            required
          ></textarea>
          {touched.content && errors.content && (
            <p className="form-error">{errors.content}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !articleData.title.trim() || !articleData.content.trim()}
        >
          {isLoading ? 'Публикация...' : 'Опубликовать'}
        </button>
      </form>
    </section>
  );
});

CreateArticle.displayName = 'CreateArticle';
export default CreateArticle;