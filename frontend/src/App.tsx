import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contests from "./pages/Contests";
import CreateContest from "./pages/CreateContest";
import ContestDetail from "./pages/ContestDetail";
import ContestProblem from "./pages/ContestProblem";
import ContestLeaderboard from "./pages/ContestLeaderboard";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./utils/authContext";
import Problems from "./pages/Problems";
import ProblemDetail from "./pages/ProblemDetail";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('codePlatformUser') !== null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Problem routes */}
                <Route 
                  path="/problems" 
                  element={
                    <ProtectedRoute>
                      <Problems />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/problems/:id" 
                  element={
                    <ProtectedRoute>
                      <ProblemDetail />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Contest routes */}
                <Route 
                  path="/contests" 
                  element={
                    <ProtectedRoute>
                      <Contests />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/contests/create" 
                  element={
                    <ProtectedRoute>
                      <CreateContest />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/contest/:contestId" 
                  element={
                    <ProtectedRoute>
                      <ContestDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/contest/:contestId/problem/:questionId" 
                  element={
                    <ProtectedRoute>
                      <ContestProblem />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/contest/:contestId/leaderboard" 
                  element={
                    <ProtectedRoute>
                      <ContestLeaderboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
