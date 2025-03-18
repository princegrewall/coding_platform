import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Demo credentials check (in a real app, this would be an API call)
      if (email === 'demo@example.com' && password === 'password') {
        const newUser = { id: '1', username: 'demouser', email };
        setUser(newUser);
        localStorage.setItem('codePlatformUser', JSON.stringify(newUser));
        toast.success('Logged in successfully', {
          description: `Welcome back, ${newUser.username}!`,
          duration: 3000,
        });
        navigate('/problems');
      } else {
        toast.error('Invalid credentials', {
          description: 'Please check your email and password.',
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error('Login failed', {
        description: 'Please try again later.',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Demo signup (in a real app, this would be an API call)
      const newUser = { id: Date.now().toString(), username, email };
      setUser(newUser);
      localStorage.setItem('codePlatformUser', JSON.stringify(newUser));
      toast.success('Account created successfully', {
        description: `Welcome, ${username}!`,
        duration: 3000,
      });
      navigate('/problems');
    } catch (error) {
      toast.error('Signup failed', {
        description: 'Please try again later.',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('codePlatformUser');
    toast.success('Logged out successfully', {
      duration: 3000,
    });
    navigate('/');
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
