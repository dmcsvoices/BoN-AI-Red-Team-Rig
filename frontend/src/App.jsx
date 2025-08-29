import { useState, useEffect } from 'react';
import SessionManager from './components/SessionManager';
import SessionDetail from './components/SessionDetail';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('sessions');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

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

  const handleBackToSessions = () => {
    window.location.hash = '';
    setCurrentView('sessions');
    setSelectedSessionId(null);
  };

  return (
    <div className="min-h-screen">
      {currentView === 'sessions' && <SessionManager />}
      {currentView === 'session-detail' && selectedSessionId && (
        <SessionDetail 
          sessionId={selectedSessionId} 
          onBack={handleBackToSessions}
        />
      )}
    </div>
  );
}

export default App;