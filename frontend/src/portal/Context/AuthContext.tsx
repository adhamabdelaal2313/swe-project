import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiUrl } from '../../config/api';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('teamflow_user');
      const storedToken = localStorage.getItem('teamflow_token');
      
      if (storedUser && storedToken) {
        // Set initial state from storage
        setUser(JSON.parse(storedUser));
        setToken(storedToken);

        try {
          // Verify and sync with database
          const response = await fetch(apiUrl('/api/portal/refresh'), {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('teamflow_user', JSON.stringify(data.user));
            localStorage.setItem('teamflow_token', data.token);
          } else if (response.status === 401) {
            // Token expired or invalid, clear session
            localStorage.removeItem('teamflow_user');
            localStorage.removeItem('teamflow_token');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Auth sync error:', error);
        }
      }
      setIsAuthReady(true);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const url = apiUrl('/api/portal/login');
      console.log('[Login] Attempting login to:', url);
      console.log('[Login] Email:', email);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('[Login] Response status:', response.status);
      console.log('[Login] Response ok:', response.ok);

      let data;
      try {
        data = await response.json();
        console.log('[Login] Response data:', data);
      } catch (parseError) {
        const text = await response.text();
        console.error('[Login] Failed to parse JSON. Response text:', text);
        return { 
          success: false, 
          message: `Server error: ${response.status} ${response.statusText}` 
        };
      }

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('teamflow_user', JSON.stringify(data.user));
        localStorage.setItem('teamflow_token', data.token);
        return { success: true };
      }
      
      console.error('[Login] Login failed:', data.message || 'Unknown error');
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      // Provide more helpful error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return { 
          success: false, 
          message: 'Could not connect to server. Please check your internet connection and ensure the backend is running.' 
        };
      }
      return { success: false, message: `Connection error: ${errorMessage}` };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(apiUrl('/api/portal/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('teamflow_user', JSON.stringify(data.user));
        localStorage.setItem('teamflow_token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      // Provide more helpful error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return { 
          success: false, 
          message: 'Could not connect to server. Please check your internet connection and ensure the backend is running.' 
        };
      }
      return { success: false, message: `Connection error: ${errorMessage}` };
    }
  };

  const logout = async () => {
    try {
      await fetch(apiUrl('/api/portal/logout'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user?.id, email: user?.email })
      });
    } catch (error) {
      console.warn('Logout log failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('teamflow_user');
      localStorage.removeItem('teamflow_token');
    }
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    // Use apiUrl helper to ensure correct base URL in production
    const fullUrl = url.startsWith('http') ? url : apiUrl(url);
    return fetch(fullUrl, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      register,
      logout, 
      isAuthenticated: !!user, 
      isAuthReady,
      fetchWithAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
