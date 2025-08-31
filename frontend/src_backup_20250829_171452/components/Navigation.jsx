import { useState } from 'react';

export default function Navigation({ currentView, onNavigate, sessionCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'sessions', label: 'Sessions', icon: '📋', description: 'Manage prompt testing sessions' },
    { id: 'techniques', label: 'Techniques', icon: '🎯', description: 'Browse attack techniques' },
    { id: 'analytics', label: 'Analytics', icon: '📊', description: 'View session analytics' },
    { id: 'settings', label: 'Settings', icon: '⚙️', description: 'System settings' }
  ];

  return (
    <nav className="bg-gray-900 border-b-2 border-purple-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                BoN HITL
              </div>
              <div className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                MVP
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                    currentView === item.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                  title={item.description}
                >
                  <span>{item.icon}</span>
                  {item.label}
                  {item.id === 'sessions' && sessionCount > 0 && (
                    <span className="ml-1 bg-cyan-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {sessionCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Backend</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Database</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <button
              onClick={() => onNavigate('sessions', 'new')}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              <span>➕</span>
              New Session
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors flex items-center gap-2 ${
                  currentView === item.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
                {item.id === 'sessions' && sessionCount > 0 && (
                  <span className="ml-auto bg-cyan-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {sessionCount}
                  </span>
                )}
              </button>
            ))}
            
            <div className="border-t border-gray-700 pt-2 mt-2">
              <button
                onClick={() => {
                  onNavigate('sessions', 'new');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-3 py-2 rounded-lg text-base font-medium flex items-center gap-2"
              >
                <span>➕</span>
                New Session
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}