import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/utils/authContext';
import { Code, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="animate-fade-in border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Code size={24} className="text-primary" />
            <span className="font-medium text-xl">CodeX</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <Link 
              to="/" 
              className={`transition-colors hover:text-primary ${
                location.pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/contests" 
                  className={`transition-colors hover:text-primary ${
                    location.pathname.startsWith('/contest') ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Contests
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                Welcome, <span className="font-medium text-foreground">{user?.username}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-1.5"
              >
                <LogOut size={16} />
                <span className="hidden md:inline-block">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
