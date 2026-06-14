import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User is authenticated but does not have the required role
      return <Navigate to="/admin" replace />; // Redirect to their default dashboard
    }

    return <Outlet />;
  } catch (error) {
    // Invalid user data in local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
}
