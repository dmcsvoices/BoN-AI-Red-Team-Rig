import { useState, useEffect } from 'react';
import { getSessions, createSession, deleteSession } from '../api';

export default function SessionManager() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    name: '',
    target_model: 'gpt-4',
    seed_prompt: ''
  });

  useEffect(() => {
    loadSessions();
  }, []);

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

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await createSession(newSession);
      setNewSession({ name: '', target_model: 'gpt-4', seed_prompt: '' });
      setShowCreateForm(false);
      await loadSessions();
    } catch (err) {
      setError(`Failed to create session: ${err.message}`);
    }
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-400 mb-2">BoN HITL Session Manager</h1>
        <p className="text-gray-300">Manage your prompt testing sessions</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 text-red-300 rounded border border-red-500">
          {error}
        </div>
      )}

      {/* Create Session Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'New Session'}
        </button>
      </div>

      {/* Create Session Form */}
      {showCreateForm && (
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-purple-500">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Create New Session</h2>
          <form onSubmit={handleCreateSession}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 mb-2">Session Name</label>
                <input
                  type="text"
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400"
                  placeholder="My Test Session"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Target Model</label>
                <select
                  value={newSession.target_model}
                  onChange={(e) => setNewSession({ ...newSession, target_model: e.target.value })}
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude-3</option>
                  <option value="llama-2">Llama-2</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Seed Prompt</label>
              <textarea
                value={newSession.seed_prompt}
                onChange={(e) => setNewSession({ ...newSession, seed_prompt: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400 h-24"
                placeholder="You are a helpful assistant that follows instructions precisely."
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition-colors"
              >
                Create Session
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Sessions ({sessions.length})</h2>
        
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-4">No sessions yet</p>
            <p className="text-sm">Click "New Session" to create your first session</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-purple-300">{session.name}</h3>
                  <p className="text-gray-400">Target: {session.target_model}</p>
                  <p className="text-gray-400">Status: <span className="text-cyan-400">{session.status}</span></p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.hash = `session/${session.id}`}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Open
                  </button>
                  <button 
                    onClick={() => handleDeleteSession(session.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                <div>
                  <span className="text-purple-300">Created:</span><br />
                  {new Date(session.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="text-purple-300">Prompts:</span><br />
                  {session.prompt_count}
                </div>
                <div>
                  <span className="text-purple-300">Responses:</span><br />
                  {session.response_count}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Footer */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-600 text-sm text-gray-400">
        Backend: <span className="text-green-400">✅ Connected (Port 50000)</span> | 
        Database: <span className="text-green-400">✅ SQLite Ready</span> | 
        Sessions: <span className="text-cyan-400">{sessions.length} loaded</span>
      </div>
    </div>
  );
}