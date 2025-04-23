import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/utils/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Code } from 'lucide-react';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, isAuthenticated, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = `${firstName} ${lastName}`;
    await signup(username, email, password);
  };

  if (isAuthenticated) {
    return <Navigate to="/problems" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-background border rounded-xl shadow-sm p-8">
          <div className="flex flex-col space-y-1.5 text-center mb-6">
            <div className="flex justify-center mb-2">
              <Code size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Create an account</h2>
            <p className="text-sm text-muted-foreground">
              Sign up to get started with CodeCraft
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  minLength={2}
                  className="focus-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  minLength={2}
                  className="focus-ring"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="focus-ring"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="focus-ring"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
              {!isLoading && <ArrowRight size={16} />}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </div>
          
          <div className="mt-6 text-xs text-center text-muted-foreground">
            By signing up, you agree to our{' '}
            <Link to="#" className="hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="#" className="hover:underline">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
