import React from 'react';

interface StatusWrapperProps {
  loading: boolean;
  error: string | null;
  isEmpty?: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

const StatusWrapper: React.FC<StatusWrapperProps> = ({
  loading,
  error,
  isEmpty,
  children,
  loadingComponent = (
    <div className="auth-screen">
      <div className="auth-card">
        <h2 className="auth-title">Загрузка...</h2>
      </div>
    </div>
  )
}) => {
  if (loading) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h2 className="auth-title">Ошибка: {error}</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <p>Данных пока нет</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default StatusWrapper;