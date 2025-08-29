import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import SessionManager from './components/SessionManager';
import SessionDetail from './components/SessionDetail';
import Settings from './components/Settings';
import { getSessions } from './api';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('sessions');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    // Handle URL hash changes for navigation
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash.startsWith('session/')) {
        const sessionId = parseInt(hash.split('/')[1]);
        setSelectedSessionId(sessionId);
        setCurrentView('session-detail');
      } else {
        setCurrentView('sessions');
        setSelectedSessionId(null);
      }
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    // Load session count for navigation
    const loadSessionCount = async () => {
      try {
        const response = await getSessions();
        setSessionCount(response.data.length);
      } catch (err) {
        console.error('Failed to load session count:', err);
      }
    };

    loadSessionCount();
    // Refresh count every 30 seconds
    const interval = setInterval(loadSessionCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (view, action) => {
    if (view === 'sessions') {
      setCurrentView('sessions');
      window.location.hash = '';
    } else {
      setCurrentView(view);
      window.location.hash = view;
    }
  };

  const handleBackToSessions = () => {
    window.location.hash = '';
    setCurrentView('sessions');
    setSelectedSessionId(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'sessions':
        return <SessionManager />;
      case 'session-detail':
        return selectedSessionId ? (
          <SessionDetail 
            sessionId={selectedSessionId} 
            onBack={handleBackToSessions}
          />
        ) : <div className="p-8 text-center text-red-400">Session not found</div>;
      case 'techniques':
        return (
          <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-purple-400 mb-4">Attack Techniques</h1>
            <p className="text-gray-300">Attack techniques documentation coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-purple-400 mb-4">Analytics</h1>
            <p className="text-gray-300">Session analytics and reporting coming soon...</p>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return <SessionManager />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation 
        currentView={currentView}
        onNavigate={handleNavigate}
        sessionCount={sessionCount}
      />
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;