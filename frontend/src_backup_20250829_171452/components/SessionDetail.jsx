import { useState, useEffect } from 'react';
import { getSession, generatePrompt, evaluateResponse } from '../api';
import { ATTACK_TECHNIQUES, TECHNIQUE_CATEGORIES } from '../data/attackTechniques';

export default function SessionDetail({ sessionId, onBack }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTechnique, setSelectedTechnique] = useState('prompt_injection');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [evaluatingResponse, setEvaluatingResponse] = useState(false);
  const [editedSeedPrompt, setEditedSeedPrompt] = useState('');
  const [isEditingSeed, setIsEditingSeed] = useState(false);
  const [testPrompt, setTestPrompt] = useState('');
  const [targetResponse, setTargetResponse] = useState('');
  const [evaluationResult, setEvaluationResult] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const response = await getSession(sessionId);
      setSession(response.data);
      setEditedSeedPrompt(response.data.seed_prompt);
      setError(null);
    } catch (err) {
      setError(`Failed to load session: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeedPrompt = async () => {
    try {
      // Here we would call an API to update the session's seed prompt
      // For now, we'll just update the local state
      setSession(prev => ({
        ...prev,
        seed_prompt: editedSeedPrompt
      }));
      setIsEditingSeed(false);
    } catch (err) {
      setError(`Failed to save seed prompt: ${err.message}`);
    }
  };

  const handleGeneratePrompt = async () => {
    try {
      setGeneratingPrompt(true);
      await generatePrompt(sessionId, selectedTechnique);
      await loadSession(); // Reload to show new prompt variant
    } catch (err) {
      setError(`Failed to generate prompt: ${err.message}`);
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleEvaluateResponse = async () => {
    try {
      setEvaluatingResponse(true);
      const responseData = {
        test_prompt: testPrompt,
        target_response: targetResponse,
        evaluation_result: evaluationResult
      };
      await evaluateResponse(sessionId, responseData);
      await loadSession(); // Reload to show new response
      // Clear form
      setTestPrompt('');
      setTargetResponse('');
      setEvaluationResult('');
    } catch (err) {
      setError(`Failed to evaluate response: ${err.message}`);
    } finally {
      setEvaluatingResponse(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center text-purple-400">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center text-red-400">Session not found</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'configuration', label: 'Configuration', icon: '⚙️' },
    { id: 'techniques', label: 'Attack Techniques', icon: '🎯' },
    { id: 'evaluation', label: 'Response Testing', icon: '🧪' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Session Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="synthwave-card p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{session.prompt_variants?.length || 0}</div>
                  <div className="text-sm text-gray-300">Attack Prompts</div>
                </div>
              </div>
              <div className="synthwave-card p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{session.responses?.length || 0}</div>
                  <div className="text-sm text-gray-300">Responses Tested</div>
                </div>
              </div>
              <div className="synthwave-card p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full pulse mr-2"></div>
                    <div className="text-lg font-bold text-green-400">Active</div>
                  </div>
                  <div className="text-sm text-gray-300">Session Status</div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="synthwave-card p-6">
              <h3 className="text-xl font-semibold text-purple-300 mb-4">Session Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Target Model</label>
                  <div className="text-lg text-white font-medium">{session.target_model}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Created</label>
                  <div className="text-lg text-white font-medium">
                    {new Date(session.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Generation LLM</label>
                  <div className="text-lg text-purple-300 font-medium">{session.prompt_generation_llm}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Evaluation LLM</label>
                  <div className="text-lg text-cyan-300 font-medium">{session.evaluation_llm}</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'configuration':
        return (
          <div className="space-y-6">
            {/* Edit Seed Prompt */}
            <div className="synthwave-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-purple-300">Seed Prompt Configuration</h3>
                <button
                  onClick={() => {
                    if (isEditingSeed) {
                      handleSaveSeedPrompt();
                    } else {
                      setIsEditingSeed(true);
                    }
                  }}
                  className="synthwave-button"
                >
                  {isEditingSeed ? 'Save Changes' : 'Edit Prompt'}
                </button>
              </div>
              
              {isEditingSeed ? (
                <textarea
                  value={editedSeedPrompt}
                  onChange={(e) => setEditedSeedPrompt(e.target.value)}
                  className="synthwave-input w-full h-40 resize-none"
                  placeholder="Enter the seed prompt for this session..."
                />
              ) : (
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 min-h-[10rem] whitespace-pre-wrap text-gray-300">
                  {editedSeedPrompt || 'No seed prompt set'}
                </div>
              )}
            </div>
          </div>
        );

      case 'techniques':
        return (
          <div className="space-y-6">
            {/* Attack Technique Selection */}
            <div className="synthwave-card p-6">
              <h3 className="text-xl font-semibold text-cyan-300 mb-6">Select Attack Technique</h3>
              
              <div className="mb-6">
                <select
                  value={selectedTechnique}
                  onChange={(e) => setSelectedTechnique(e.target.value)}
                  className="synthwave-input w-full"
                >
                  <optgroup label="🎯 Core Techniques">
                    {TECHNIQUE_CATEGORIES.core.map(techId => {
                      const tech = ATTACK_TECHNIQUES.find(t => t.id === techId);
                      return <option key={techId} value={techId}>{tech.name}</option>;
                    })}
                  </optgroup>
                  <optgroup label="🔧 Advanced Techniques">
                    {TECHNIQUE_CATEGORIES.advanced.map(techId => {
                      const tech = ATTACK_TECHNIQUES.find(t => t.id === techId);
                      return <option key={techId} value={techId}>{tech.name}</option>;
                    })}
                  </optgroup>
                  <optgroup label="🧠 Social Engineering">
                    {TECHNIQUE_CATEGORIES.social.map(techId => {
                      const tech = ATTACK_TECHNIQUES.find(t => t.id === techId);
                      return <option key={techId} value={techId}>{tech.name}</option>;
                    })}
                  </optgroup>
                </select>
                
                {selectedTechnique && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                    <div className="text-sm font-medium text-cyan-300 mb-2">Technique Description:</div>
                    <div className="text-gray-300">
                      {ATTACK_TECHNIQUES.find(t => t.id === selectedTechnique)?.description}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleGeneratePrompt}
                disabled={generatingPrompt}
                className="synthwave-button flex items-center space-x-2 disabled:opacity-50"
              >
                {generatingPrompt && <div className="synthwave-loading"></div>}
                <span>{generatingPrompt ? 'Generating...' : 'Generate Attack Prompt'}</span>
              </button>
            </div>
          </div>
        );

      case 'evaluation':
        return (
          <div className="space-y-6">
            {/* Evaluate Response */}
            <div className="synthwave-card p-6">
              <h3 className="text-xl font-semibold text-pink-300 mb-6">Response Evaluation Toolkit</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Test Prompt</label>
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="synthwave-input w-full h-24 resize-none"
                    placeholder="Enter the attack prompt you tested..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Target Model Response</label>
                  <textarea
                    value={targetResponse}
                    onChange={(e) => setTargetResponse(e.target.value)}
                    className="synthwave-input w-full h-32 resize-none"
                    placeholder="Paste the response from the target model here..."
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleEvaluateResponse}
                    disabled={evaluatingResponse || !testPrompt || !targetResponse}
                    className="synthwave-button flex items-center space-x-2 disabled:opacity-50"
                  >
                    {evaluatingResponse && <div className="synthwave-loading"></div>}
                    <span>{evaluatingResponse ? 'Analyzing...' : 'Evaluate Response'}</span>
                  </button>
                </div>
                
                {evaluationResult && (
                  <div>
                    <label className="block text-sm font-medium text-green-300 mb-2">Evaluation Result</label>
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20 whitespace-pre-wrap text-gray-300 min-h-[6rem]">
                      {evaluationResult}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="synthwave-card p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Sessions</span>
              </button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent neon-text mb-2">
                {session.name}
              </h1>
              <div className="flex items-center space-x-4 text-gray-300">
                <span>Target: <span className="text-purple-300 font-medium">{session.target_model}</span></span>
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                <span>Status: <span className="text-cyan-300 font-medium">{session.status}</span></span>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-400">{session.prompt_variants?.length || 0}</div>
                <div className="text-sm text-gray-300">Prompts</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                <div className="text-2xl font-bold text-cyan-400">{session.responses?.length || 0}</div>
                <div className="text-sm text-gray-300">Responses</div>
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

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="synthwave-card p-2">
            <div className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple'
                      : 'text-gray-300 hover:text-white hover:bg-purple-500/20'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
