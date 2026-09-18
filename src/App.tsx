import React, { useState } from 'react';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { TraceLandingPage } from './pages/TraceLandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardShell } from './components/dashboard/shell/DashboardShell';

export function App() {
  const [viewState, setViewState] = useState<'loading' | 'landing' | 'login' | 'dashboard'>('loading');

  return (
    <main className="bg-[#050816] min-h-screen text-slate-100 selection:bg-[#00C2FF]/30 selection:text-[#00C2FF]">
      {viewState === 'loading' && (
        <LoadingScreen onComplete={() => setViewState('landing')} />
      )}

      {viewState === 'landing' && (
        <TraceLandingPage onNavigateToLogin={() => setViewState('login')} />
      )}

      {viewState === 'login' && (
        <LoginPage
          onBackToLanding={() => setViewState('landing')}
          onLoginSuccess={() => setViewState('dashboard')}
        />
      )}

      {viewState === 'dashboard' && (
        <DashboardShell
          onExitToLanding={() => setViewState('landing')}
          onLogout={() => setViewState('login')}
        />
      )}
    </main>
  );
}

export default App;
