import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SessionRestorer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only try to restore the session if we're at the root path
    // This prevents overriding direct URL navigation
    if (location.pathname === '/') {
      const lastVisitedPath = localStorage.getItem('lastVisitedPath');
      
      // If there's a saved path and it's not the login page, navigate to it
      // Note: We don't restore if the last path was dashboard or root, to allow dashboard to work properly
      if (lastVisitedPath && 
          lastVisitedPath !== '/' && 
          lastVisitedPath !== '/login' && 
          lastVisitedPath !== '/signup') {
        navigate(lastVisitedPath);
      }
    }
    
    // When navigating to dashboard, update the lastVisitedPath
    if (location.pathname === '/') {
      localStorage.setItem('lastVisitedPath', '/');
    }
  }, [navigate, location.pathname]);

  // This component doesn't render anything
  return null;
};

export default SessionRestorer; 