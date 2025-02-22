import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { pathname } = useLocation();
  const token = localStorage.getItem('token');

  return token || document.cookie ? children : (
    <Navigate 
      to="/login" 
      state={{ 
        from: pathname, 
        ...(pathname !== '/' && { message: "You need to login first" })
      }} 
      replace
    />
  )
};