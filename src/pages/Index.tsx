
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Zap, Trophy, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/utils/authContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero section */}
      <section className="py-20 md:py-28 container-custom relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
            <span className="animate-pulse">•</span> Welcome to CodeCraft
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight md:leading-tight tracking-tight animate-slide-up">
            Master coding challenges.
            <span className="block text-primary">Build your skills.</span>
          </h1>
          
          <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
            Practice with our curated collection of coding problems and elevate your programming expertise through hands-on challenges.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {isAuthenticated ? (
              <Link to="/problems">
                <Button size="lg" className="gap-2">
                  Start Coding
                  <ArrowRight size={16} />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="gap-2">
                    Get Started
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Log In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_40%_at_50%_60%,rgba(20,20,20,0.04)_0%,rgba(20,20,20,0)_100%)]" />
      </section>

      {/* Features section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 animate-fade-in">
            <h2 className="text-3xl font-semibold mb-4">
              Designed for Developers
            </h2>
            <p className="text-muted-foreground">
              Our platform offers everything you need to prepare for technical interviews and improve your coding skills.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            <FeatureCard
              icon={<Code size={24} />}
              title="Diverse Problem Set"
              description="From easy to challenging problems across various domains and difficulty levels."
            />
            <FeatureCard
              icon={<Layout size={24} />}
              title="Interactive IDE"
              description="Write, run, and test your code directly in your browser with our powerful editor."
              delay={100}
            />
            <FeatureCard
              icon={<Zap size={24} />}
              title="Instant Feedback"
              description="Get immediate results with our test cases to improve your solutions quickly."
              delay={200}
            />
            <FeatureCard
              icon={<Trophy size={24} />}
              title="Track Progress"
              description="Monitor your problem-solving journey and celebrate your achievements."
              delay={300}
            />
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 md:py-24 container-custom">
        <div className="bg-primary/5 rounded-2xl p-8 md:p-12 relative overflow-hidden animate-fade-in">
          <div className="max-w-2xl relative z-10">
            <h2 className="text-3xl font-semibold mb-4">
              Ready to level up your coding skills?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of developers who are mastering algorithms and data structures on our platform.
            </p>
            
            {isAuthenticated ? (
              <Link to="/problems">
                <Button size="lg" className="gap-2">
                  Explore Problems
                  <ArrowRight size={16} />
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button size="lg" className="gap-2">
                  Get Started for Free
                  <ArrowRight size={16} />
                </Button>
              </Link>
            )}
          </div>
          
          {/* Background decoration */}
          <div className="absolute right-0 bottom-0 w-1/2 h-1/2 opacity-20 -z-10">
            <Code size={280} className="absolute right-4 bottom-0 text-primary" />
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = 0 }) => (
  <div 
    className="bg-background rounded-xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up" 
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
