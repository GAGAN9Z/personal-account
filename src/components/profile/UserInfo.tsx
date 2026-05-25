import React, { memo, useState, useRef, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { changeAvatar } from '../../store/authSlice';
import type { UserInfoProps } from '../../utils/interfaces';
import EditProfile from './EditProfile';

const API_BASE_URL = 'http://localhost:1337';

// добавление функции сравнения
const areEqual = (prevProps: UserInfoProps, nextProps: UserInfoProps) => {
  return (
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.user?.username === nextProps.user?.username &&
    prevProps.user?.email === nextProps.user?.email &&
    prevProps.user?.avatar?.url === nextProps.user?.avatar?.url &&
    prevProps.onLogout === nextProps.onLogout
  );
};

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
    
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }
    
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

  // мемоизирация URL аватара
  const avatarUrl = useMemo(() =>
    user?.avatar?.url ? `${API_BASE_URL}${user.avatar.url}` : null,
    [user?.avatar?.url]
  );

  // мемоизация инициала для placeholder'а
  const avatarInitial = useMemo(() => 
    user?.username?.charAt(0).toUpperCase() || '?',
    [user?.username]
  );

  if (!user || !user.username) {
    return (
      <aside className="profile-card">
        <p>Загрузка профиля...</p>
      </aside>
    );
  }

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
              {avatarInitial}
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
        
        <h2 className="profile-title">{user.username}</h2>
        <p className="profile-email">{user.email}</p>
        
        {user.age && (
          <p className="profile-age">Возраст: {user.age} лет</p>
        )}
        
        {user.phone && (
          <p className="profile-phone">Телефон: {user.phone}</p>
        )}
        
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
}, areEqual);

UserInfo.displayName = 'UserInfo';
export default UserInfo;