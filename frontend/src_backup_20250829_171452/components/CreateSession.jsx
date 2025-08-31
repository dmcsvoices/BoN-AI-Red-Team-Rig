import { useState, useEffect } from 'react';
import { createSession } from '../api';

export default function CreateSession({ onBack, onSessionCreated }) {
  const [availableModels, setAvailableModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [evaluationModels, setEvaluationModels] = useState([]);
  const [evaluationModelsLoading, setEvaluationModelsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newSession, setNewSession] = useState({
    name: '',
    target_model: '',
    seed_prompt: '',
    prompt_generation_llm: '',
    evaluation_llm: ''
  });

  useEffect(() => {
    loadModels();
    loadEvaluationModels();

    // Listen for settings changes
    const handleSettingsChange = () => {
      loadModels();
      loadEvaluationModels();
    };

    window.addEventListener('bonHitlSettingsChanged', handleSettingsChange);
    return () => window.removeEventListener('bonHitlSettingsChanged', handleSettingsChange);
  }, []);

  const loadModels = async () => {
    try {
      setModelsLoading(true);
      const settings = JSON.parse(localStorage.getItem('bonHitlSettings') || '{}');
      const promptGenerationUrl = settings.promptGenerationUrl || 'http://localhost:1234';
      
      const response = await fetch(`http://localhost:50000/api/models/prompt-generation?prompt_generation_url=${encodeURIComponent(promptGenerationUrl)}`);
      if (response.ok) {
        const data = await response.json();
        const models = data.data.map(model => model.id);
        setAvailableModels(models);
        // Set default model if available
        if (models.length > 0 && !newSession.prompt_generation_llm) {
          setNewSession(prev => ({
            ...prev,
            prompt_generation_llm: models[0]
          }));
        }
      } else {
        console.warn('Failed to load models from prompt generation server');
      }
    } catch (err) {
      console.warn('Could not connect to prompt generation server for models:', err.message);
    } finally {
      setModelsLoading(false);
    }
  };

  const loadEvaluationModels = async () => {
    try {
      setEvaluationModelsLoading(true);
      const settings = JSON.parse(localStorage.getItem('bonHitlSettings') || '{}');
      const evaluationUrl = settings.evaluationUrl || 'http://172.27.0.93:11434';
      
      const response = await fetch(`http://localhost:50000/api/models/evaluation?evaluation_url=${encodeURIComponent(evaluationUrl)}`);
      if (response.ok) {
        const data = await response.json();
        const models = data.data.map(model => model.id);
        setEvaluationModels(models);
        // Set default model if available
        if (models.length > 0 && !newSession.evaluation_llm) {
          setNewSession(prev => ({
            ...prev,
            evaluation_llm: models[0]
          }));
        }
      } else {
        console.warn('Failed to load evaluation models from evaluation server, status:', response.status);
      }
    } catch (err) {
      console.warn('Could not connect to evaluation server for models:', err.message);
    } finally {
      setEvaluationModelsLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      await createSession(newSession);
      
      // Reset form
      setNewSession({ 
        name: '', 
        target_model: '', 
        seed_prompt: '', 
        prompt_generation_llm: availableModels.length > 0 ? availableModels[0] : '', 
        evaluation_llm: evaluationModels.length > 0 ? evaluationModels[0] : '' 
      });
      
      // Notify parent and navigate back
      if (onSessionCreated) onSessionCreated();
      onBack();
    } catch (err) {
      setError(`Failed to create session: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="synthwave-card p-8 mb-8">
          <div className="flex items-center justify-between">
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
                Create New Session
              </h1>
              <p className="text-gray-300 text-lg">Configure your AI security testing environment</p>
            </div>
            
            <div className="hidden lg:block">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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

        {/* Form Cards */}
        <form onSubmit={handleCreateSession} className="space-y-8">
          {/* Basic Information Card */}
          <div className="synthwave-card p-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 mr-3">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-400 neon-text">Basic Information</h2>
                <p className="text-gray-300">Define your testing session</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Session Name *
                </label>
                <input
                  type="text"
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                  className="synthwave-input w-full"
                  placeholder="e.g., GPT-4 Jailbreak Test"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Target Model *
                </label>
                <input
                  type="text"
                  value={newSession.target_model}
                  onChange={(e) => setNewSession({ ...newSession, target_model: e.target.value })}
                  className="synthwave-input w-full"
                  placeholder="gpt-4, claude-3.5-sonnet, llama-3.1-70b"
                  required
                />
                <p className="text-xs text-gray-400">The AI model you want to test for vulnerabilities</p>
              </div>
            </div>
          </div>

          {/* Model Configuration Card */}
          <div className="synthwave-card p-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30 mr-3">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 neon-text">Model Configuration</h2>
                <p className="text-gray-300">Select your AI model servers</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Prompt Generation LLM *
                  {modelsLoading && <span className="synthwave-loading ml-2"></span>}
                </label>
                <select
                  value={newSession.prompt_generation_llm}
                  onChange={(e) => setNewSession({ ...newSession, prompt_generation_llm: e.target.value })}
                  className="synthwave-input w-full"
                  required
                  disabled={modelsLoading}
                >
                  {modelsLoading ? (
                    <option value="">🔄 Loading models...</option>
                  ) : availableModels.length === 0 ? (
                    <option value="">⚠️ No models available</option>
                  ) : (
                    <>
                      <option value="">Select generation model</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <p className="text-xs text-gray-400">LLM used to craft attack prompts</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Evaluation LLM *
                  {evaluationModelsLoading && <span className="synthwave-loading ml-2"></span>}
                </label>
                <select
                  value={newSession.evaluation_llm}
                  onChange={(e) => setNewSession({ ...newSession, evaluation_llm: e.target.value })}
                  className="synthwave-input w-full"
                  required
                  disabled={evaluationModelsLoading}
                >
                  {evaluationModelsLoading ? (
                    <option value="">🔄 Loading models...</option>
                  ) : evaluationModels.length === 0 ? (
                    <option value="">⚠️ No models available</option>
                  ) : (
                    <>
                      <option value="">Select evaluation model</option>
                      {evaluationModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <p className="text-xs text-gray-400">LLM used to analyze target responses</p>
              </div>
            </div>
          </div>

          {/* Seed Prompt Card */}
          <div className="synthwave-card p-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-lg flex items-center justify-center border border-pink-500/30 mr-3">
                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-pink-400 neon-text">Seed Prompt</h2>
                <p className="text-gray-300">Base prompt for attack variations</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-pink-300 mb-2">
                System Prompt *
              </label>
              <textarea
                value={newSession.seed_prompt}
                onChange={(e) => setNewSession({ ...newSession, seed_prompt: e.target.value })}
                className="synthwave-input w-full h-40 resize-none"
                placeholder="You are a helpful AI assistant. Please follow all instructions carefully and provide accurate information."
                required
              />
              <p className="text-xs text-gray-400">Base system prompt that will be used as foundation for attack variations</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <div className="text-sm text-gray-400">
              * Required fields
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || modelsLoading || evaluationModelsLoading}
                className="synthwave-button px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {creating && <div className="synthwave-loading"></div>}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>{creating ? 'Creating...' : 'Create Session'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}