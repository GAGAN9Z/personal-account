import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { updateUserProfile } from '../../store/authSlice';
import type { EditProfileFormData, EditProfileProps } from '../../utils/interfaces';
import { validateEditProfile, type FormErrors } from '../../utils/validators';


const EditProfile: React.FC<EditProfileProps> = ({ user, isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<EditProfileFormData>({
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    phone: user.phone || '',
    age: user.age?.toString() || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      phone: user.phone || '',
      age: user.age?.toString() || '',
    });
  }, [user]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'username' || name === 'email') {
      const validationErrors = validateEditProfile({
        username: name === 'username' ? value : formData.username,
        email: name === 'email' ? value : formData.email
      });
      setErrors(validationErrors);
    }
  }, [formData]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateEditProfile({
      username: formData.username,
      email: formData.email
    });
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ username: true, email: true, bio: true, phone: true, age: true });
      return;
    }
    
    setIsLoading(true);
    try {
      await dispatch(updateUserProfile({
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        phone: formData.phone,
        age: formData.age ? parseInt(formData.age) : undefined,
      })).unwrap();
      
      onClose();
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, formData, onClose]);

  if (!isOpen) return null;

  return (
    <dialog className="modal" open={isOpen} onClose={onClose}>
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="auth-title">Редактировать профиль</h2>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="edit-username">Имя пользователя</label>
            <input
              id="edit-username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={touched.username && errors.username ? 'error' : ''}
            />
            {touched.username && errors.username && (
              <p className="form-error">{errors.username}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-email">Email</label>
            <input
              id="edit-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={touched.email && errors.email ? 'error' : ''}
            />
            {touched.email && errors.email && (
              <p className="form-error">{errors.email}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-age">Возраст</label>
            <input
              id="edit-age"
              name="age"
              type="number"
              placeholder="25"
              value={formData.age}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              min="1"
              max="150"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-phone">Телефон</label>
            <input
              id="edit-phone"
              name="phone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-bio">О себе</label>
            <textarea
              id="edit-bio"
              name="bio"
              placeholder="Расскажите о себе..."
              value={formData.bio}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              rows={3}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </dialog>
  );
};

export default EditProfile;