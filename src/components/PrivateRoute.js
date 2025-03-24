// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Este componente verifica la autenticación y los permisos basados en roles
const PrivateRoute = ({ children, requiredRoles = [], requiredZone = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Si aún estamos cargando, no mostramos nada
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Si se requieren roles específicos
  if (requiredRoles.length > 0) {
    // Convertir el rol del usuario a número si viene como string
    const userRoleId = typeof user.role === 'string' && !isNaN(parseInt(user.role)) 
      ? parseInt(user.role) 
      : user.role;
    
    // Verificar si el usuario tiene uno de los roles requeridos
    const hasRequiredRole = requiredRoles.includes(userRoleId);
    
    if (!hasRequiredRole) {
      console.log("Access denied. User role:", userRoleId, "Required roles:", requiredRoles);
      // Redirigir a una página de acceso denegado
      return <Navigate to="/access-denied" replace />;
    }
  }
  
  // Si se requiere una zona específica
  if (requiredZone && user.zone !== requiredZone && user.role !== 1) {
    // Los administradores (role 1) pueden acceder a todas las zonas
    return <Navigate to="/access-denied" replace />;
  }
  
  // Si pasa todas las verificaciones, renderizar el componente hijo
  return children;
};

export default PrivateRoute;