import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import type React from 'react';
import ProtectedRoute from './components/hoc/ProtectedRoute';
import StatusWrapper from './components/hoc/StatusWrapper';
import { selectIsAuth, selectAuthLoading, selectAuthError} from './store/authSlice';


const App: React.FC = () => {
  const isAuth = useSelector(selectIsAuth);
  const authLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  
  return (
    <BrowserRouter>
      <StatusWrapper loading={authLoading} error={authError}>
        <Routes>
          <Route path="/login" element={!isAuth ? <Login /> : <Navigate to="/profile" replace />} />
          <Route path="/register" element={!isAuth ? <Register /> : <Navigate to="/profile" replace />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={isAuth ? "/profile" : "/login"} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StatusWrapper>
    </BrowserRouter>
  );
};
export default App;