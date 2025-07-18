import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setAuthState(parsed);
      } catch (error) {
        localStorage.removeItem('admin_auth');
      }
    }
  }, []);

  const login = (credentials: { username: string; password: string }) => {
    const newAuthState = {
      isAuthenticated: true,
      user: { username: credentials.username }
    };
    setAuthState(newAuthState);
    localStorage.setItem('admin_auth', JSON.stringify(newAuthState));
  };

  const logout = () => {
    const newAuthState = {
      isAuthenticated: false,
      user: null
    };
    setAuthState(newAuthState);
    localStorage.removeItem('admin_auth');
  };

  return {
    ...authState,
    login,
    logout
  };
};
