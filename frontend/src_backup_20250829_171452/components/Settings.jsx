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
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="synthwave-card p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent neon-text mb-2">
                System Configuration
              </h1>
              <p className="text-gray-300 text-lg">Configure your AI security testing infrastructure</p>
            </div>
            <div className="hidden lg:block">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
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

        {saved && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-xl border border-green-500/30 glow-cyan">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Settings saved successfully!
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Model Endpoints Section */}
          <div className="synthwave-card p-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 mr-3">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 neon-text">Model Endpoint URLs</h2>
                <p className="text-gray-300">Configure your AI model server connections</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Prompt Generation URL */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Prompt Generation Server
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={settings.promptGenerationUrl}
                      onChange={(e) => setSettings({ ...settings, promptGenerationUrl: e.target.value })}
                      className="synthwave-input flex-1"
                      placeholder="http://localhost:1234"
                    />
                    <button
                      onClick={() => testConnection(settings.promptGenerationUrl, 'Prompt Generation')}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 glow-cyan"
                    >
                      Test
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    🎯 Server for crafting attack prompts • Endpoint: /v1/models
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <div className="text-sm font-medium text-purple-300 mb-2">Expected Response:</div>
                  <div className="text-xs text-gray-400 font-mono">
                    GET {settings.promptGenerationUrl}/v1/models
                  </div>
                </div>
              </div>

              {/* Evaluation URL */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Evaluation Server
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={settings.evaluationUrl}
                      onChange={(e) => setSettings({ ...settings, evaluationUrl: e.target.value })}
                      className="synthwave-input flex-1"
                      placeholder="http://172.27.0.93:11434"
                    />
                    <button
                      onClick={() => testConnection(settings.evaluationUrl, 'Evaluation')}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 glow-cyan"
                    >
                      Test
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    🧪 Server for analyzing responses • Endpoint: /v1/models
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                  <div className="text-sm font-medium text-cyan-300 mb-2">Expected Response:</div>
                  <div className="text-xs text-gray-400 font-mono">
                    GET {settings.evaluationUrl}/v1/models
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Changes will take effect immediately after saving
            </div>
            <div className="flex gap-4">
              <button
                onClick={resetToDefaults}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all duration-300"
              >
                Reset Defaults
              </button>
              <button
                onClick={saveSettings}
                className="synthwave-button px-8 py-3 font-semibold flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Configuration</span>
              </button>
            </div>
          </div>

          {/* Current Status */}
          <div className="synthwave-card p-6">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-green-500/30 mr-3">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-300">Active Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                <div className="text-sm text-gray-400 mb-2">Prompt Generation Endpoint</div>
                <div className="text-purple-300 font-mono text-sm break-all">
                  {settings.promptGenerationUrl}/v1/models
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                <div className="text-sm text-gray-400 mb-2">Evaluation Endpoint</div>
                <div className="text-cyan-300 font-mono text-sm break-all">
                  {settings.evaluationUrl}/v1/models
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}