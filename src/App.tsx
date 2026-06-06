import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { GameProvider } from './contexts/GameContext';
import Login from './components/auth/Login';
import Game from '@/components/game/Game';
import { useGame } from './contexts/GameContext';

const queryClient = new QueryClient();

// Protected route component that redirects to login if not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useGame();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/game" 
                element={
                  <ProtectedRoute>
                    <Game />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
