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
    evaluation: null,
    embedding: null
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
    const newStatus = { backend: null, promptGen: null, evaluation: null, embedding: null };

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

    try {
      // Test embedding server (use same function as prompt generation)
      const embeddingUrl = localSettings.embeddingUrl || localSettings.promptGenUrl;
      await getPromptGenerationModels(embeddingUrl);
      newStatus.embedding = true;
    } catch (error) {
      newStatus.embedding = false;
    }

    setConnectionStatus(newStatus);
    setIsTestingConnections(false);
  };

  const resetToDefaults = () => {
    setLocalSettings({
      promptGenUrl: 'http://localhost:1234/v1',
      evaluationUrl: 'http://172.27.0.93:11434/v1',
      embeddingUrl: 'http://localhost:1234/v1'
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

        <div className="form-group">
          <label className="form-label">Embedding Generation Server URL:</label>
          <input
            type="url"
            className="input"
            value={localSettings.embeddingUrl || localSettings.promptGenUrl}
            onChange={(e) => setLocalSettings({
              ...localSettings, 
              embeddingUrl: e.target.value
            })}
            style={{ width: '100%' }}
            placeholder="http://localhost:1234/v1"
          />
          <div style={{ 
            fontSize: '12px', 
            color: SYNTHWAVE_COLORS.textSecondary, 
            marginTop: '5px' 
          }}>
            Server hosting the model used for generating vector embeddings (often same as prompt generation server)
          </div>
        </div>
      </div>

      {/* Embedding Configuration */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ color: SYNTHWAVE_COLORS.secondary, marginBottom: '15px' }}>
          Embedding Generation Settings
        </h3>
        
        <div className="form-group">
          <label className="form-label">Embedding Model:</label>
          <select
            className="input"
            value={localSettings.embeddingModel || 'text-embedding-3-small'}
            onChange={(e) => setLocalSettings({
              ...localSettings, 
              embeddingModel: e.target.value
            })}
            style={{ width: '100%' }}
          >
            <option value="text-embedding-3-small">text-embedding-3-small (1536 dimensions)</option>
            <option value="text-embedding-3-large">text-embedding-3-large (3072 dimensions)</option>
            <option value="text-embedding-ada-002">text-embedding-ada-002 (1536 dimensions)</option>
            <option value="nomic-embed-text">nomic-embed-text (768 dimensions)</option>
            <option value="custom">Custom Model</option>
          </select>
          <div style={{ 
            fontSize: '12px', 
            color: SYNTHWAVE_COLORS.textSecondary, 
            marginTop: '5px' 
          }}>
            Model used for generating vector embeddings. Must be compatible with your embedding server.
          </div>
        </div>

        {localSettings.embeddingModel === 'custom' && (
          <div className="form-group">
            <label className="form-label">Custom Embedding Model Name:</label>
            <input
              type="text"
              className="input"
              value={localSettings.customEmbeddingModel || ''}
              onChange={(e) => setLocalSettings({
                ...localSettings, 
                customEmbeddingModel: e.target.value
              })}
              style={{ width: '100%' }}
              placeholder="Enter custom model name"
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Processing Schedule:</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="time"
              className="input"
              value={localSettings.embeddingSchedule1 || '06:00'}
              onChange={(e) => setLocalSettings({
                ...localSettings, 
                embeddingSchedule1: e.target.value
              })}
            />
            <span style={{ color: SYNTHWAVE_COLORS.textSecondary }}>and</span>
            <input
              type="time"
              className="input"
              value={localSettings.embeddingSchedule2 || '23:00'}
              onChange={(e) => setLocalSettings({
                ...localSettings, 
                embeddingSchedule2: e.target.value
              })}
            />
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: SYNTHWAVE_COLORS.textSecondary, 
            marginTop: '5px' 
          }}>
            Daily times when embedding generation will run automatically (avoids conflicts with main app usage)
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <input
              type="checkbox"
              checked={localSettings.enableEmbeddingQueue !== false}
              onChange={(e) => setLocalSettings({
                ...localSettings, 
                enableEmbeddingQueue: e.target.checked
              })}
              style={{ marginRight: '8px' }}
            />
            Enable Automatic Embedding Generation
          </label>
          <div style={{ 
            fontSize: '12px', 
            color: SYNTHWAVE_COLORS.textSecondary, 
            marginTop: '5px' 
          }}>
            When enabled, embeddings will be generated automatically during scheduled times for better similarity search
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
          <ConnectionIndicator 
            status={connectionStatus.embedding} 
            label="Embedding Generation Server" 
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
          
          <p><strong>Embedding Server:</strong> This server generates vector embeddings for similarity search. Often the same as the prompt generation server, but can be a dedicated embedding model for better performance.</p>
          
          <p><strong>API Compatibility:</strong> All servers must support OpenAI-compatible APIs - chat completions at `/v1/chat/completions`, models at `/v1/models`, and embeddings at `/v1/embeddings`.</p>
          
          <p><strong>Embedding Queue:</strong> Embeddings are generated automatically during scheduled times to avoid conflicts with model usage for prompt generation and evaluation.</p>
          
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