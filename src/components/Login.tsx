import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom'; 
import { loginUser, selectAuthLoading, selectAuthError, clearError } from '../store/authSlice';
import type { AppDispatch } from '../store';
import { validateLogin, type FormErrors } from '../utils/validators';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    
    const validationErrors = validateLogin({ ...formData, [name]: value });
    setErrors(validationErrors);
  }, [formData]);
  
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);
  
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateLogin(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ email: true, password: true });
      return;
    }
    
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      navigate('/profile');
    }
  }, [dispatch, formData, navigate]);
  
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Войти в систему</h1>
        <form onSubmit={handleLogin} className="form">
          <div className="form-group">
            <label htmlFor="login-email">Электронная почта или Логин</label>
            <input
              id="login-email"
              name="email"
              type="text"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={touched.email && errors.email ? 'error' : ''}
              required
              autoComplete="email"
            />
            {touched.email && errors.email && (
              <p className="form-error">{errors.email}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="login-password">Пароль</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className={touched.password && errors.password ? 'error' : ''}
              required
              autoComplete="current-password"
            />
            {touched.password && errors.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>
          
          {error && <p className="form-error" role="alert">{error}</p>} 
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
        
        <p className="auth-footer">
          Нет аккаунта?
          <Link to="/register" className="link-btn">Создать аккаунт</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;