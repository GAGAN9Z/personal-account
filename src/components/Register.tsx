import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, selectAuthLoading, selectAuthError, clearError } from '../store/authSlice';
import type { AppDispatch } from '../store';
import { validateRegister, type FormErrors } from '../utils/validators';

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // валидация при изменении
    const validationErrors = validateRegister({ ...formData, [name]: value });
    setErrors(validationErrors);
  }, [formData]);
  
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);
  
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // валидация перед отправкой
    const validationErrors = validateRegister(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // отмечаем все поля как touched
      setTouched({ username: true, email: true, password: true });
      return;
    }
    
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      navigate('/profile');
    }
  }, [dispatch, formData, navigate]);
  
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h2 className="auth-title">Регистрация</h2>
        <form onSubmit={handleRegister} className="form">
          <div className="form-group">
            <label htmlFor="username">Ваше имя</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="RocketMan"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={touched.username && errors.username ? 'error' : ''}
              required
            />
            {touched.username && errors.username && (
              <p className="form-error">{errors.username}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={touched.email && errors.email ? 'error' : ''}
              required
            />
            {touched.email && errors.email && (
              <p className="form-error">{errors.email}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={touched.password && errors.password ? 'error' : ''}
              required
            />
            {touched.password && errors.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>
          
          {error && <p className="form-error" role="alert">{error}</p>} 
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login" className="link-btn">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;