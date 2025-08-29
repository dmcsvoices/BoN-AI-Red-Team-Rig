import { useState, useEffect } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    promptGenerationUrl: 'http://localhost:1234',
    evaluationUrl: 'http://172.27.0.93:11434'
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load settings from localStorage on component mount
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('bonHitlSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          promptGenerationUrl: parsedSettings.promptGenerationUrl || 'http://localhost:1234',
          evaluationUrl: parsedSettings.evaluationUrl || 'http://172.27.0.93:11434'
        });
      }
    } catch (err) {
      console.warn('Failed to load settings from localStorage:', err);
      setError('Failed to load saved settings');
    }
  };

  const saveSettings = () => {
    try {
      // Validate URLs
      const promptUrl = new URL(settings.promptGenerationUrl);
      const evalUrl = new URL(settings.evaluationUrl);
      
      // Save to localStorage
      localStorage.setItem('bonHitlSettings', JSON.stringify(settings));
      setSaved(true);
      setError(null);
      
      // Clear saved indicator after 3 seconds
      setTimeout(() => setSaved(false), 3000);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('bonHitlSettingsChanged', { detail: settings }));
    } catch (err) {
      setError('Please enter valid URLs (include http:// or https://)');
    }
  };

  const resetToDefaults = () => {
    setSettings({
      promptGenerationUrl: 'http://localhost:1234',
      evaluationUrl: 'http://172.27.0.93:11434'
    });
    setError(null);
  };

  const testConnection = async (url, type) => {
    try {
      // Use backend proxy to avoid CORS issues
      const endpoint = type === 'Prompt Generation' 
        ? `http://localhost:50000/api/models/prompt-generation?prompt_generation_url=${encodeURIComponent(url)}`
        : `http://localhost:50000/api/models/evaluation?evaluation_url=${encodeURIComponent(url)}`;
        
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        alert(`✅ Connection successful!\n${type}: Found ${data.data?.length || 0} models`);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        alert(`❌ Connection failed!\n${type}: ${errorData.detail || `Status ${response.status}`}`);
      }
    } catch (err) {
      alert(`❌ Connection failed!\n${type}: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-400 mb-2">Advanced Global Settings</h1>
        <p className="text-gray-300">Configure model endpoint URLs and system preferences</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 text-red-300 rounded border border-red-500">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-6 p-4 bg-green-900 text-green-300 rounded border border-green-500">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-8">
        {/* Model Endpoints Section */}
        <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Model Endpoint URLs</h2>
          <p className="text-gray-300 mb-6 text-sm">
            Configure the base URLs for your model servers. These should point to OpenAI-compatible API endpoints.
          </p>
          
          <div className="space-y-6">
            {/* Prompt Generation URL */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Prompt Generation Server
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={settings.promptGenerationUrl}
                  onChange={(e) => setSettings({ ...settings, promptGenerationUrl: e.target.value })}
                  className="flex-1 p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  placeholder="http://localhost:1234"
                />
                <button
                  onClick={() => testConnection(settings.promptGenerationUrl, 'Prompt Generation')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Test
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Server used to generate attack prompts. Should provide models at {settings.promptGenerationUrl}/v1/models
              </p>
            </div>

            {/* Evaluation URL */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Evaluation Server
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={settings.evaluationUrl}
                  onChange={(e) => setSettings({ ...settings, evaluationUrl: e.target.value })}
                  className="flex-1 p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  placeholder="http://172.27.0.93:11434"
                />
                <button
                  onClick={() => testConnection(settings.evaluationUrl, 'Evaluation')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Test
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Server used to evaluate model responses. Should provide models at {settings.evaluationUrl}/v1/models
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={saveSettings}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Save Settings
          </button>
          <button
            onClick={resetToDefaults}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Reset to Defaults
          </button>
        </div>

        {/* Current Status */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">Current Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Prompt Generation:</span>
              <div className="text-cyan-400 font-mono break-all">{settings.promptGenerationUrl}/v1/models</div>
            </div>
            <div>
              <span className="text-gray-400">Evaluation:</span>
              <div className="text-cyan-400 font-mono break-all">{settings.evaluationUrl}/v1/models</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}