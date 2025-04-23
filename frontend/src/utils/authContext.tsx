import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010';

  useEffect(() => {
    // Check local storage for user data on initial load
    const storedUser = localStorage.getItem('codePlatformUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call the actual backend API
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const userData = response.data.user;
        // Format to match our User interface
        const newUser = { 
          id: userData.userId, 
          username: `${userData.firstName} ${userData.lastName}`.trim(), 
          email: userData.email 
        };
        
        setUser(newUser);
        localStorage.setItem('codePlatformUser', JSON.stringify(newUser));
        
        toast.success('Logged in successfully', {
          description: `Welcome back, ${newUser.username}!`,
          duration: 3000,
        });
        navigate('/contests');
      } else {
        toast.error('Login failed', {
          description: response.data.message || 'Please check your credentials.',
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: error.response?.data?.message || 'Please check your credentials.',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Get firstName and lastName from username
      let firstName = '';
      let lastName = '';
      
      if (username && username.includes(' ')) {
        const nameParts = username.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        firstName = username || '';
        lastName = 'User'; // Provide a default last name if none exists
      }
      
      // Debug the request payload
      const requestData = { firstName, lastName, email, password };
      console.log('Signup request data:', requestData);
      
      // Call the actual backend API
      const response = await axios.post(
        `${API_URL}/auth/signup`,
        requestData,
        { withCredentials: true }
      );
      
      console.log('Signup response:', response.data);
      
      if (response.data.success) {
        toast.success('Account created successfully', {
          description: `Welcome, ${firstName} ${lastName}! Please log in.`,
          duration: 3000,
        });
        navigate('/login');
      } else {
        toast.error('Signup failed', {
          description: response.data.message || 'Please try again later.',
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      // Log the detailed error response if available
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        console.log('Error response headers:', error.response.headers);
      }
      
      // Show a more specific error message for 409 Conflict (email already exists)
      if (error.response?.status === 409) {
        toast.error('Email already in use', {
          description: 'This email address is already registered. Please use a different email or log in.',
          duration: 5000,
        });
      } else {
        toast.error('Signup failed', {
          description: error.response?.data?.message || 'Please try again later.',
          duration: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call the backend API to log out
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      
      // Clear local state
      setUser(null);
      localStorage.removeItem('codePlatformUser');
      
      toast.success('Logged out successfully', {
        duration: 3000,
      });
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear local state
      setUser(null);
      localStorage.removeItem('codePlatformUser');
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
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
