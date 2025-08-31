import { useState, useEffect } from 'react';

const SidebarIcon = ({ name }) => {
  const icons = {
    sessions: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    techniques: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    analytics: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    settings: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    plus: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    menu: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    close: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    // NEW CHEVRON ICONS ADDED
    'chevron-left': (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    ),
    'chevron-right': (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    ),
    'chevron-down': (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
    'chevron-up': (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    )
  };
  
  return icons[name] || null;
};

export default function Sidebar({ currentView, onNavigate, sessionCount = 0, isCollapsed, setIsCollapsed }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const navItems = [
    { 
      id: 'sessions', 
      label: 'Sessions', 
      description: 'Manage prompt testing sessions',
      count: sessionCount 
    },
    { 
      id: 'techniques', 
      label: 'Techniques', 
      description: 'Browse attack techniques' 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      description: 'View session analytics' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      description: 'System configuration' 
    }
  ];

  const handleNavigate = (view, action) => {
    onNavigate(view, action);
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'w-72 md:w-72'}
        ${isMobile ? 'w-72' : ''}
      `}>
        <div className="h-full synthwave-card rounded-none md:rounded-r-2xl border-l-0 md:border-l border-r-2 border-r-purple-500">
          {/* Header */}
          <div className="p-6 border-b border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className={`flex items-center transition-all duration-300 ${isCollapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent neon-text">
                  BoN HITL
                </div>
                <div className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full glow-purple">
                  MVP
                </div>
              </div>
              
              {/* Toggle Button - NOW USES CHEVRONS */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-purple-500/20 transition-colors text-purple-300 hover:text-white"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <SidebarIcon name={isCollapsed && !isMobile ? "chevron-right" : "chevron-left"} />
              </button>
            </div>

            {/* Quick Stats */}
            {(!isCollapsed || isMobile) && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg border border-purple-500/30">
                  <div className="text-lg font-bold text-cyan-400">{sessionCount}</div>
                  <div className="text-xs text-gray-300">Sessions</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-r from-cyan-500/20 to-green-500/20 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full pulse mr-1"></div>
                    <div className="text-xs text-gray-300">Live</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`
                  w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative
                  ${currentView === item.id
                    ? 'bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white glow-purple'
                    : 'text-gray-300 hover:text-white hover:bg-purple-500/20'
                  }
                `}
                title={isCollapsed && !isMobile ? item.description : ''}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <SidebarIcon name={item.id} />
                  {(!isCollapsed || isMobile) && (
                    <span className="ml-3 font-medium truncate">{item.label}</span>
                  )}
                  {(!isCollapsed || isMobile) && item.count > 0 && (
                    <span className="ml-auto bg-cyan-600 text-white text-xs px-2 py-1 rounded-full glow-cyan">
                      {item.count}
                    </span>
                  )}
                </div>

                {/* Tooltip for collapsed state */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    {item.count > 0 && (
                      <span className="ml-2 bg-cyan-600 text-white text-xs px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}

            {/* Quick Actions */}
            <div className="pt-4 border-t border-purple-500/30">
              <button
                onClick={() => handleNavigate('sessions', 'new')}
                className="w-full flex items-center p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 glow-purple hover:glow-pink group"
              >
                <SidebarIcon name="plus" />
                {(!isCollapsed || isMobile) && (
                  <span className="ml-3 font-semibold">New Session</span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    New Session
                  </div>
                )}
              </button>
            </div>
          </nav>

          {/* Footer Status */}
          {(!isCollapsed || isMobile) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-500/30">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full pulse"></div>
                    <span className="text-gray-300">Backend</span>
                  </div>
                  <span className="text-green-400">Online</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full pulse"></div>
                    <span className="text-gray-300">Database</span>
                  </div>
                  <span className="text-green-400">Ready</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Toggle Button */}
      {isMobile && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 left-4 z-40 p-3 synthwave-button rounded-xl glow-purple"
        >
          <SidebarIcon name="menu" />
        </button>
      )}
    </>
  );
}