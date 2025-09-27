import { useState, useEffect } from 'react';
import { getPromptGenerationModels, getEvaluationModels, getSessions } from './api';
import SessionsTab from './components/SessionsTab';
import PromptsTab from './components/PromptsTab';
import ReviewTab from './components/ReviewTab';
import SearchTab from './components/SearchTab';
import SettingsTab from './components/SettingsTab';
import './App.css';

// Synthwave color scheme from POC1.py
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

function App() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [genModels, setGenModels] = useState([]);
  const [evalModels, setEvalModels] = useState([]);
  const [selectedGenModel, setSelectedGenModel] = useState('');
  const [selectedEvalModel, setSelectedEvalModel] = useState('');
  const [settings, setSettings] = useState({
    promptGenUrl: 'http://localhost:1234/v1',
    evaluationUrl: 'http://192.168.1.71:11434/v1'
  });
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('bon-hitl-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load saved model selections
    const savedGenModel = localStorage.getItem('bon-hitl-selected-gen-model');
    const savedEvalModel = localStorage.getItem('bon-hitl-selected-eval-model');
    
    if (savedGenModel) {
      setSelectedGenModel(savedGenModel);
    }
    if (savedEvalModel) {
      setSelectedEvalModel(savedEvalModel);
    }
  }, []);

  // Load models when settings change
  useEffect(() => {
    loadModels();
  }, [settings]);

  // Load sessions on mount and when refresh is triggered
  useEffect(() => {
    loadSessions();
  }, [refreshTrigger]);

  // Update selected session when session ID changes
  useEffect(() => {
    if (selectedSessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === parseInt(selectedSessionId));
      setSelectedSession(session || null);
    } else {
      setSelectedSession(null);
    }
  }, [selectedSessionId, sessions]);

  const loadModels = async () => {
    console.log('Loading models with settings:', settings);
    
    // Load prompt generation models
    try {
      console.log('Calling getPromptGenerationModels with:', settings.promptGenUrl);
      const genData = await getPromptGenerationModels(settings.promptGenUrl);
      console.log('Raw gen response:', genData);
      
      if (genData?.data) {
        const models = genData.data.map(m => m.id);
        console.log('Extracted prompt generation models:', models);
        setGenModels(models);
        if (models.length > 0 && !selectedGenModel && !localStorage.getItem('bon-hitl-selected-gen-model')) {
          const firstModel = models[0];
          setSelectedGenModel(firstModel);
          localStorage.setItem('bon-hitl-selected-gen-model', firstModel);
        }
      } else {
        console.warn('No data.data found in gen response:', genData);
        setGenModels([]);
      }
    } catch (error) {
      console.error('Failed to load prompt generation models:', error);
      setGenModels([]);
    }

    // Load evaluation models
    try {
      console.log('Calling getEvaluationModels with:', settings.evaluationUrl);
      const evalData = await getEvaluationModels(settings.evaluationUrl);
      console.log('Raw eval response:', evalData);
      
      if (evalData?.data) {
        const models = evalData.data.map(m => m.id);
        console.log('Extracted evaluation models:', models);
        setEvalModels(models);
        if (models.length > 0 && !selectedEvalModel && !localStorage.getItem('bon-hitl-selected-eval-model')) {
          const firstModel = models[0];
          setSelectedEvalModel(firstModel);
          localStorage.setItem('bon-hitl-selected-eval-model', firstModel);
        }
      } else {
        console.warn('No data.data found in eval response:', evalData);
        setEvalModels([]);
      }
    } catch (error) {
      console.error('Failed to load evaluation models:', error);
      setEvalModels([]);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    }
  };

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('bon-hitl-settings', JSON.stringify(newSettings));
  };

  const refreshSessions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app" style={{ 
      backgroundColor: SYNTHWAVE_COLORS.background,
      minHeight: '100vh',
      color: SYNTHWAVE_COLORS.text,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div className="header" style={{
        padding: '10px 20px',
        borderBottom: `2px solid ${SYNTHWAVE_COLORS.border}`,
        backgroundColor: SYNTHWAVE_COLORS.card
      }}>
        <h1 style={{ 
          color: SYNTHWAVE_COLORS.primary, 
          margin: '0 0 15px 0',
          fontSize: '24px',
          textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
        }}>
          BoN Jailbreaking Rig - Best-of-N AI Red Team Testing
        </h1>
        
        <div className="model-selectors" style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ color: SYNTHWAVE_COLORS.text, minWidth: '100px' }}>
              Session:
            </label>
            <select 
              value={selectedSessionId} 
              onChange={(e) => setSelectedSessionId(e.target.value)}
              style={{
                padding: '5px 10px',
                backgroundColor: SYNTHWAVE_COLORS.card,
                color: sessions.length === 0 ? SYNTHWAVE_COLORS.textSecondary : SYNTHWAVE_COLORS.text,
                border: `1px solid ${sessions.length === 0 ? '#ff4444' : SYNTHWAVE_COLORS.border}`,
                borderRadius: '4px',
                minWidth: '200px'
              }}
            >
              <option value="">Select a session...</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.id}: {session.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ color: SYNTHWAVE_COLORS.text, minWidth: '140px' }}>
              Prompt Gen Model:
            </label>
            <select 
              value={selectedGenModel} 
              onChange={(e) => {
                const value = e.target.value;
                setSelectedGenModel(value);
                localStorage.setItem('bon-hitl-selected-gen-model', value);
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: SYNTHWAVE_COLORS.card,
                color: genModels.length === 0 ? SYNTHWAVE_COLORS.textSecondary : SYNTHWAVE_COLORS.text,
                border: `1px solid ${genModels.length === 0 ? '#ff4444' : SYNTHWAVE_COLORS.border}`,
                borderRadius: '4px',
                minWidth: '200px'
              }}
            >
              {genModels.length === 0 ? (
                <option>⚠️ No models (check Settings)</option>
              ) : (
                genModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))
              )}
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ color: SYNTHWAVE_COLORS.text, minWidth: '140px' }}>
              Response Eval Model:
            </label>
            <select 
              value={selectedEvalModel} 
              onChange={(e) => {
                const value = e.target.value;
                setSelectedEvalModel(value);
                localStorage.setItem('bon-hitl-selected-eval-model', value);
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: SYNTHWAVE_COLORS.card,
                color: SYNTHWAVE_COLORS.text,
                border: `1px solid ${SYNTHWAVE_COLORS.border}`,
                borderRadius: '4px',
                minWidth: '200px'
              }}
            >
              {evalModels.length === 0 ? (
                <option>No models available</option>
              ) : (
                evalModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="main-content" style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
        <div className="tabs" style={{
          width: '200px',
          backgroundColor: SYNTHWAVE_COLORS.card,
          borderRight: `2px solid ${SYNTHWAVE_COLORS.border}`,
          padding: '20px 0'
        }}>
          {['sessions', 'prompts', 'review', 'search', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                width: '100%',
                padding: '15px 20px',
                border: 'none',
                backgroundColor: activeTab === tab ? SYNTHWAVE_COLORS.primary : 'transparent',
                color: activeTab === tab ? SYNTHWAVE_COLORS.background : SYNTHWAVE_COLORS.text,
                textAlign: 'left',
                fontSize: '16px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.target.style.backgroundColor = SYNTHWAVE_COLORS.accent;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="tab-content" style={{ 
          flex: 1, 
          padding: '20px',
          overflow: 'auto'
        }}>
          {activeTab === 'sessions' && (
            <SessionsTab 
              sessions={sessions}
              setSessions={setSessions}
              refreshTrigger={refreshTrigger}
              onRefresh={refreshSessions}
            />
          )}
          {activeTab === 'prompts' && (
            <PromptsTab 
              selectedSession={selectedSession}
              selectedGenModel={selectedGenModel}
              settings={settings}
            />
          )}
          {activeTab === 'review' && (
            <ReviewTab 
              selectedSession={selectedSession}
              selectedEvalModel={selectedEvalModel}
              settings={settings}
            />
          )}
          {activeTab === 'search' && (
            <SearchTab />
          )}
          {activeTab === 'settings' && (
            <SettingsTab 
              settings={settings}
              onSave={saveSettings}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;