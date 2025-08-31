import { useState, useEffect } from 'react';
import { getSessions, deleteSession } from '../api';

export default function SessionManager({ onNavigateToCreate }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());

  useEffect(() => {
    loadSessions();
  }, []);

  const toggleCardExpansion = (sessionId) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(sessionId)) {
      newExpandedCards.delete(sessionId);
    } else {
      newExpandedCards.add(sessionId);
    }
    setExpandedCards(newExpandedCards);
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await getSessions();
      setSessions(response.data);
      setError(null);
    } catch (err) {
      setError(`Failed to load sessions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshSessions = async () => {
    await loadSessions();
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(sessionId);
        await loadSessions();
      } catch (err) {
        setError(`Failed to delete session: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center text-purple-400">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="synthwave-card p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent neon-text mb-2">
                Session Manager
              </h1>
              <p className="text-gray-300 text-lg">Orchestrate your AI security testing campaigns</p>
            </div>
            
            {/* Quick Stats Dashboard */}
            <div className="mt-6 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-400">{sessions.length}</div>
                <div className="text-sm text-gray-300">Total Sessions</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                <div className="text-2xl font-bold text-cyan-400">{sessions.reduce((sum, s) => sum + (s.prompt_count || 0), 0)}</div>
                <div className="text-sm text-gray-300">Prompts Generated</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                <div className="text-2xl font-bold text-green-400">{sessions.reduce((sum, s) => sum + (s.response_count || 0), 0)}</div>
                <div className="text-sm text-gray-300">Responses Tested</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <div className="flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full pulse mr-2"></div>
                  <div className="text-sm text-gray-300 font-medium">Active</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Create Session Button */}
          <div className="flex justify-between items-center">
            <div></div>
            <button
              onClick={onNavigateToCreate}
              className="synthwave-button px-6 py-3 font-semibold flex items-center space-x-2 glow-purple"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Session</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 rounded-xl border border-red-500/30 glow-pink">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Sessions Grid/List */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-cyan-400 neon-text">
              Active Sessions
              <span className="ml-3 text-lg text-gray-400 font-normal">({sessions.length})</span>
            </h2>
          </div>
          
          {sessions.length === 0 ? (
            <div className="synthwave-card p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                  <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Sessions Yet</h3>
                <p className="text-gray-400 mb-6">Create your first AI security testing session to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {sessions.map((session) => {
                const isExpanded = expandedCards.has(session.id);
                return (
                  <div 
                    key={session.id} 
                    className="synthwave-card group relative overflow-hidden transition-all duration-300"
                  >
                    {/* Card Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Minimized View */}
                    {!isExpanded && (
                      <div 
                        className="p-4 cursor-pointer relative z-10"
                        onClick={() => toggleCardExpansion(session.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <h3 className="text-lg font-bold text-purple-300 mb-1 truncate group-hover:text-purple-200 transition-colors">
                              {session.name}
                            </h3>
                            <p className="text-gray-400 text-sm truncate">Target: {session.target_model}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                              {session.status}
                            </span>
                            <button 
                              onClick={() => toggleCardExpansion(session.id)}
                              className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                              title="Expand card"
                            >
                              <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="p-6 relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-purple-300 mb-1 truncate group-hover:text-purple-200 transition-colors">
                              {session.name}
                            </h3>
                            <p className="text-gray-400 text-sm truncate">Target: {session.target_model}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                              {session.status}
                            </span>
                            <button 
                              onClick={() => toggleCardExpansion(session.id)}
                              className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                              title="Minimize card"
                            >
                              <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                            <div className="text-2xl font-bold text-purple-400">{session.prompt_count || 0}</div>
                            <div className="text-xs text-gray-400">Prompts</div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                            <div className="text-2xl font-bold text-cyan-400">{session.response_count || 0}</div>
                            <div className="text-xs text-gray-400">Responses</div>
                          </div>
                        </div>

                        {/* Seed Prompt */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20">
                          <div className="text-xs text-pink-300 font-medium mb-2">Seed Prompt</div>
                          <div className="text-sm text-gray-300 max-h-20 overflow-y-auto">
                            {session.seed_prompt ? (
                              <div className="whitespace-pre-wrap break-words">
                                {session.seed_prompt.length > 150 
                                  ? `${session.seed_prompt.substring(0, 150)}...` 
                                  : session.seed_prompt}
                              </div>
                            ) : (
                              <div className="text-gray-400 italic">No seed prompt set</div>
                            )}
                          </div>
                        </div>

                        {/* Models Info */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-gray-500/10 to-gray-600/10 rounded-lg border border-gray-500/20">
                          <div className="text-xs text-gray-400 mb-1">Configuration</div>
                          <div className="text-sm text-gray-300">
                            <div className="truncate">Gen: <span className="text-purple-300">{session.prompt_generation_llm}</span></div>
                            <div className="truncate">Eval: <span className="text-cyan-300">{session.evaluation_llm}</span></div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Show/Hide</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400 text-xs">
                              {new Date(session.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => window.location.hash = `session/${session.id}`}
                              className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-xs font-medium transition-all duration-300 glow-cyan"
                            >
                              Open
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                              className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg text-xs font-medium transition-all duration-300 glow-pink hover:shadow-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hover Effect Border */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/30 rounded-xl transition-colors duration-300"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}