import { useState, useEffect } from 'react';
import { getPromptGenerationModels, getEvaluationModels, healthCheck } from '../api';

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

function SettingsTab({ settings, onSave }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [connectionStatus, setConnectionStatus] = useState({
    backend: null,
    promptGen: null,
    evaluation: null
  });
  const [isTestingConnections, setIsTestingConnections] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    alert('Settings saved successfully!');
  };

  const testConnections = async () => {
    setIsTestingConnections(true);
    const newStatus = { backend: null, promptGen: null, evaluation: null };

    try {
      // Test backend connection
      await healthCheck();
      newStatus.backend = true;
    } catch (error) {
      newStatus.backend = false;
    }

    try {
      // Test prompt generation server
      await getPromptGenerationModels(localSettings.promptGenUrl);
      newStatus.promptGen = true;
    } catch (error) {
      newStatus.promptGen = false;
    }

    try {
      // Test evaluation server
      await getEvaluationModels(localSettings.evaluationUrl);
      newStatus.evaluation = true;
    } catch (error) {
      newStatus.evaluation = false;
    }

    setConnectionStatus(newStatus);
    setIsTestingConnections(false);
  };

  const resetToDefaults = () => {
    setLocalSettings({
      promptGenUrl: 'http://localhost:1234/v1',
      evaluationUrl: 'http://172.27.0.93:11434/v1'
    });
  };

  const ConnectionIndicator = ({ status, label }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px',
      padding: '8px',
      fontSize: '14px'
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: status === null ? '#666' : status ? '#44ff44' : '#ff4444'
      }}></div>
      <span style={{ color: SYNTHWAVE_COLORS.textSecondary }}>{label}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: '700px' }}>
      <h2 style={{ color: SYNTHWAVE_COLORS.primary, marginBottom: '20px' }}>Global Settings</h2>

      {/* LLM Server Configuration */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ color: SYNTHWAVE_COLORS.secondary, marginBottom: '15px' }}>
          LLM Server Configuration
        </h3>
        
        <div className="form-group">
          <label className="form-label">Prompt Generation Server URL:</label>
          <input
            type="url"
            className="input"
            value={localSettings.promptGenUrl}
            onChange={(e) => setLocalSettings({
              ...localSettings, 
              promptGenUrl: e.target.value
            })}
            style={{ width: '100%' }}
            placeholder="http://localhost:1234/v1"
          />
          <div style={{ 
            fontSize: '12px', 
            color: SYNTHWAVE_COLORS.textSecondary, 
            marginTop: '5px' 
          }}>
            Server hosting the LLM used for generating attack prompts (like the POC's localhost:1234)
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Response Evaluation Server URL:</label>
          <input
            type="url"
            className="input"
            value={localSettings.evaluationUrl}
            onChange={(e) => setLocalSettings({
              ...localSettings, 
              evaluationUrl: e.target.value
            })}
            style={{ width: '100%' }}
            placeholder="http://172.27.0.93:11434/v1"
          />
          <div style={{ 
            fontSize: '12px', 
            color: SYNTHWAVE_COLORS.textSecondary, 
            marginTop: '5px' 
          }}>
            Server hosting the LLM used for evaluating target model responses (like the POC's 172.27.0.93:11434)
          </div>
        </div>
      </div>

      {/* Connection Testing */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ color: SYNTHWAVE_COLORS.secondary, marginBottom: '15px' }}>
          Connection Status
        </h3>
        
        <div style={{ marginBottom: '15px' }}>
          <ConnectionIndicator 
            status={connectionStatus.backend} 
            label="Backend API Server" 
          />
          <ConnectionIndicator 
            status={connectionStatus.promptGen} 
            label="Prompt Generation Server" 
          />
          <ConnectionIndicator 
            status={connectionStatus.evaluation} 
            label="Evaluation Server" 
          />
        </div>

        <button
          onClick={testConnections}
          disabled={isTestingConnections}
          className="btn"
          style={{ 
            background: isTestingConnections ? '#666666' : SYNTHWAVE_COLORS.secondary,
            color: SYNTHWAVE_COLORS.background
          }}
        >
          {isTestingConnections ? (
            <>
              <span className="loading" style={{ marginRight: '10px' }}></span>
              Testing Connections...
            </>
          ) : (
            'Test All Connections'
          )}
        </button>
      </div>

      {/* Configuration Info */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ color: SYNTHWAVE_COLORS.secondary, marginBottom: '15px' }}>
          Configuration Notes
        </h3>
        
        <div style={{ fontSize: '14px', color: SYNTHWAVE_COLORS.textSecondary, lineHeight: '1.6' }}>
          <p><strong>Prompt Generation Server:</strong> This should be a server running an LLM that can generate attack prompts based on seed prompts and attack techniques. The POC uses localhost:1234/v1.</p>
          
          <p><strong>Evaluation Server:</strong> This should be a server running an LLM that can evaluate whether target model responses contain dangerous or harmful content. The POC uses 172.27.0.93:11434/v1.</p>
          
          <p><strong>API Compatibility:</strong> Both servers must support OpenAI-compatible chat completions API at `/v1/chat/completions` and models API at `/v1/models`.</p>
          
          <p><strong>CORS:</strong> The backend proxies these requests to avoid CORS issues, so the frontend doesn't directly connect to these servers.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          onClick={handleSave}
          className="btn"
          style={{ 
            background: SYNTHWAVE_COLORS.accent,
            minWidth: '120px'
          }}
        >
          Save Settings
        </button>
        
        <button
          onClick={resetToDefaults}
          className="btn"
          style={{ 
            background: 'transparent',
            border: `1px solid ${SYNTHWAVE_COLORS.border}`,
            color: SYNTHWAVE_COLORS.textSecondary
          }}
        >
          Reset to Defaults
        </button>
      </div>

      {/* Current Values Display */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: SYNTHWAVE_COLORS.card,
        border: `1px solid ${SYNTHWAVE_COLORS.border}`,
        borderRadius: '8px'
      }}>
        <h4 style={{ color: SYNTHWAVE_COLORS.secondary, marginBottom: '10px' }}>
          Current Settings (JSON)
        </h4>
        <pre style={{
          backgroundColor: SYNTHWAVE_COLORS.background,
          color: SYNTHWAVE_COLORS.text,
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          border: `1px solid ${SYNTHWAVE_COLORS.border}`
        }}>
          {JSON.stringify(localSettings, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default SettingsTab;