import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SessionTimeoutGuard({ children, timeoutMins = 15 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutMs = timeoutMins * 60 * 1000;

  const handleLogout = useCallback(() => {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const rememberedUsername = localStorage.getItem('rememberedUsername');

    console.warn('⚠️ SESSION EXPIRED: User inactive for over', timeoutMins, 'minutes. Clearing session cache...');

    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');

    if (rememberMe && rememberedUsername) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberedUsername', rememberedUsername);
    }

    navigate('/login', { replace: true });
  }, [navigate, timeoutMins]);

  useEffect(() => {
    // If the user is on the login screen, don't run the inactivity tracker
    if (location.pathname === '/login') return;

    let timer;

    // Reset the countdown timer whenever activity is detected
    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(handleLogout, timeoutMs);
    };

    // Tracking event listeners across the browser window viewport canvas
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Run the initial timer boot setup sequence
    resetTimer();

    // Clean up event listeners when the component unmounts or tabs shift
    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [location.pathname, timeoutMs, handleLogout]);

  return children;
}
