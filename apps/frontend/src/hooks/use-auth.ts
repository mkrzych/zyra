import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

interface Organization {
  id: string;
  name: string;
}

interface AuthData {
  user: User;
  organization: Organization;
  token: string;
}

export function useAuth() {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on mount
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setAuthData({
          token,
          user: userData.user,
          organization: userData.organization,
        });
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (token: string, user: User, organization: Organization) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({ user, organization }));
    setAuthData({ token, user, organization });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthData(null);
  };

  return {
    user: authData?.user || null,
    organization: authData?.organization || null,
    token: authData?.token || null,
    isAuthenticated: !!authData,
    isLoading,
    login,
    logout,
  };
}