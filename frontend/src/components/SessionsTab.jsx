import { useState, useEffect } from 'react';
import { getSessions, createSession, deleteSession, getPromptGenerationModels, getEvaluationModels } from '../api';

const SYNTHWAVE_COLORS = {
  background: "#0d001a",
  primary: "#ff00ff",
  secondary: "#00ffff",
  accent: "#ff0080",
  text: "#ffffff",
  textSecondary: "#a0a0ff",
  card: "#1a002e",
  border: "#4d0099"
};

function SessionsTab({ sessions, setSessions, refreshTrigger, onRefresh }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [genModels, setGenModels] = useState([]);
  const [evalModels, setEvalModels] = useState([]);
  const [targetModels, setTargetModels] = useState([]);
  const [settings, setSettings] = useState({
    promptGenUrl: 'http://localhost:1234/v1',
    evaluationUrl: 'http://172.27.0.93:11434/v1'
  });
  const [newSession, setNewSession] = useState({
    name: '',
    target_model: '',
    seed_prompt: ''
  });

  useEffect(() => {
    loadSessions();
  }, [refreshTrigger]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('bon-hitl-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Load models when settings change
  useEffect(() => {
    loadModels();
  }, [settings]);

  const loadModels = async () => {
    // Load prompt generation models
    try {
      const genData = await getPromptGenerationModels(settings.promptGenUrl);
      if (genData?.data) {
        const models = genData.data.map(m => m.id);
        setGenModels(models);
      } else {
        setGenModels([]);
      }
    } catch (error) {
      console.error('Failed to load prompt generation models:', error);
      setGenModels([]);
    }

    // Load evaluation models
    try {
      const evalData = await getEvaluationModels(settings.evaluationUrl);
      if (evalData?.data) {
        const models = evalData.data.map(m => m.id);
        setEvalModels(models);
      } else {
        setEvalModels([]);
      }
    } catch (error) {
      console.error('Failed to load evaluation models:', error);
      setEvalModels([]);
    }

    // For target models, we'll combine both sets of models
    try {
      const [genData, evalData] = await Promise.all([
        getPromptGenerationModels(settings.promptGenUrl).catch(() => ({ data: [] })),
        getEvaluationModels(settings.evaluationUrl).catch(() => ({ data: [] }))
      ]);
      
      const allModels = new Set();
      if (genData?.data) {
        genData.data.forEach(m => allModels.add(m.id));
      }
      if (evalData?.data) {
        evalData.data.forEach(m => allModels.add(m.id));
      }
      
      setTargetModels(Array.from(allModels));
    } catch (error) {
      console.error('Failed to load target models:', error);
      setTargetModels([]);
    }
  };

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await createSession(newSession);
      setNewSession({
        name: '',
        target_model: '',
        seed_prompt: ''
      });
      setShowCreateForm(false);
      loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error creating session: ' + error.message);
    }
  };

  const handleDeleteSession = async (sessionId, sessionName) => {
    if (window.confirm(`Are you sure you want to delete session "${sessionName}"?`)) {
      try {
        await deleteSession(sessionId);
        loadSessions();
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Error deleting session: ' + error.message);
      }
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      <div style={{ flex: 1, marginRight: '20px' }}>
        <h2 style={{ color: SYNTHWAVE_COLORS.primary, marginBottom: '20px' }}>Sessions</h2>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="loading"></div>
            <p style={{ marginTop: '10px', color: SYNTHWAVE_COLORS.textSecondary }}>Loading sessions...</p>
          </div>
        )}

        <div style={{
          background: SYNTHWAVE_COLORS.card,
          border: `1px solid ${SYNTHWAVE_COLORS.border}`,
          borderRadius: '8px',
          height: '400px',
          overflow: 'auto'
        }}>
          {sessions.length === 0 && !loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: SYNTHWAVE_COLORS.textSecondary }}>
              No sessions created yet.
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="list-item" style={{
                padding: '15px',
                borderBottom: `1px solid ${SYNTHWAVE_COLORS.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: SYNTHWAVE_COLORS.text }}>
                    {session.id}: {session.name}
                  </div>
                  <div style={{ color: SYNTHWAVE_COLORS.textSecondary, fontSize: '14px', marginTop: '5px' }}>
                    Target: {session.target_model} | Status: {session.status}
                  </div>
                  <div style={{ color: SYNTHWAVE_COLORS.textSecondary, fontSize: '12px', marginTop: '3px' }}>
                    Prompts: {session.prompt_count || 0} | Responses: {session.response_count || 0}
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteSession(session.id, session.name)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${SYNTHWAVE_COLORS.accent}`,
                    color: SYNTHWAVE_COLORS.accent,
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ width: '300px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn"
            style={{
              width: '100%',
              background: showCreateForm ? SYNTHWAVE_COLORS.primary : SYNTHWAVE_COLORS.accent,
              border: `1px solid ${SYNTHWAVE_COLORS.border}`
            }}
          >
            {showCreateForm ? 'Cancel' : 'New Session'}
          </button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={loadSessions}
            className="btn"
            style={{
              width: '100%',
              background: SYNTHWAVE_COLORS.secondary,
              color: SYNTHWAVE_COLORS.background
            }}
          >
            Refresh
          </button>
        </div>

        {showCreateForm && (
          <div className="card">
            <h3 style={{ color: SYNTHWAVE_COLORS.primary, marginBottom: '15px' }}>Create New Session</h3>
            <form onSubmit={handleCreateSession}>
              <div className="form-group">
                <label className="form-label">Session Name:</label>
                <input
                  type="text"
                  className="input"
                  value={newSession.name}
                  onChange={(e) => setNewSession({...newSession, name: e.target.value})}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Model:</label>
                <input
                  type="text"
                  className="input"
                  list="target-models"
                  value={newSession.target_model}
                  onChange={(e) => setNewSession({...newSession, target_model: e.target.value})}
                  required
                  style={{ width: '100%' }}
                  placeholder="e.g., gpt-4, claude-3-sonnet (type or select from list)"
                />
                <datalist id="target-models">
                  {targetModels.map(model => (
                    <option key={model} value={model} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Seed Prompt:</label>
                <textarea
                  className="textarea"
                  value={newSession.seed_prompt}
                  onChange={(e) => setNewSession({...newSession, seed_prompt: e.target.value})}
                  required
                  style={{ width: '100%', minHeight: '80px' }}
                  placeholder="Enter the base prompt to generate attacks from..."
                />
              </div>


              <button type="submit" className="btn" style={{ width: '100%' }}>
                Create Session
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionsTab;