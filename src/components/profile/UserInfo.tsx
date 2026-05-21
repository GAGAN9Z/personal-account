import React, { memo, useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { changeAvatar } from '../../store/authSlice';
import type { UserInfoProps } from '../../utils/interfaces';
import EditProfile from './EditProfile';

const API_BASE_URL = 'http://localhost:1337';

const UserInfo: React.FC<UserInfoProps> = memo(({ user, onLogout }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }
    
    // проверка размера (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }
    
    setIsUploading(true);
    try {
      await dispatch(changeAvatar(file)).unwrap();
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err);
      alert('Не удалось загрузить аватар');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [dispatch]);

  if (!user || !user.username) {
    return (
      <aside className="profile-card">
        <p>Загрузка профиля...</p>
      </aside>
    );
  }

  // формирование URL аватара
  const avatarUrl = user.avatar?.url ? `${API_BASE_URL}${user.avatar.url}` : null;

  return (
    <>
      <aside className="profile-card">
        <div
          className={`profile-avatar ${isUploading ? 'uploading' : ''}`}
          onClick={handleAvatarClick}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-label="Изменить аватар"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.username}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          {isUploading && (
            <div className="avatar-upload-overlay">
              <span>Загрузка...</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />
        
        <h2 className="auth-title">{user.username}</h2>
        <p className="auth-title">{user.email}</p>
        
        {/* возраст */}
        {user.age && (
          <p className="profile-age">Возраст: {user.age} лет</p>
        )}
        
        {/* телефон */}
        {user.phone && (
          <p className="profile-phone">Телефон: {user.phone}</p>
        )}
        
        {/* о себе */}
        {user.bio && (
          <p className="profile-bio">О себе: {user.bio}</p>
        )}
        
        <nav className="profile-actions" aria-label="Управление профилем">
          <button type="button" className="btn btn-primary" onClick={() => setIsEditModalOpen(true)}>
            Редактировать
          </button>
          <button type="button" onClick={onLogout} className="btn btn-primary">
            Выйти
          </button>
        </nav>
      </aside>

      <EditProfile
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
});

UserInfo.displayName = 'UserInfo';
export default UserInfo;