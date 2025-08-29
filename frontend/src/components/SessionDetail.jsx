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

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <button
            onClick={onBack}
            className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2"
          >
            ← Back to Sessions
          </button>
          <h1 className="text-3xl font-bold text-purple-400">{session.name}</h1>
          <p className="text-gray-300">Target: {session.target_model} | Status: {session.status}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded border border-gray-600 text-sm">
          <div className="text-purple-300">Statistics</div>
          <div className="text-gray-300">
            Prompts: {session.prompt_variants?.length || 0} | 
            Responses: {session.responses?.length || 0}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 text-red-300 rounded border border-red-500">
          {error}
        </div>
      )}

      {/* Edit Seed Phrase Section */}
      <div className="mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-400">Seed Prompt</h2>
            <button
              onClick={() => {
                if (isEditingSeed) {
                  handleSaveSeedPrompt();
                } else {
                  setIsEditingSeed(true);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
            >
              {isEditingSeed ? 'Save Changes' : 'Edit'}
            </button>
          </div>
          
          {isEditingSeed ? (
            <textarea
              value={editedSeedPrompt}
              onChange={(e) => setEditedSeedPrompt(e.target.value)}
              className="w-full p-4 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400 h-32 resize-none"
              placeholder="Enter the seed prompt for this session..."
            />
          ) : (
            <div className="bg-gray-700 p-4 rounded text-gray-300 min-h-[8rem] whitespace-pre-wrap">
              {editedSeedPrompt || 'No seed prompt set'}
            </div>
          )}
        </div>
      </div>

      {/* Attack Technique Selection */}
      <div className="mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Attack Technique</h2>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Select Attack Technique</label>
            <select
              value={selectedTechnique}
              onChange={(e) => setSelectedTechnique(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400"
            >
              <optgroup label="Core Techniques">
                {TECHNIQUE_CATEGORIES.core.map(techId => {
                  const tech = ATTACK_TECHNIQUES.find(t => t.id === techId);
                  return <option key={techId} value={techId}>{tech.name}</option>;
                })}
              </optgroup>
              <optgroup label="Advanced Techniques">
                {TECHNIQUE_CATEGORIES.advanced.map(techId => {
                  const tech = ATTACK_TECHNIQUES.find(t => t.id === techId);
                  return <option key={techId} value={techId}>{tech.name}</option>;
                })}
              </optgroup>
              <optgroup label="Social Engineering">
                {TECHNIQUE_CATEGORIES.social.map(techId => {
                  const tech = ATTACK_TECHNIQUES.find(t => t.id === techId);
                  return <option key={techId} value={techId}>{tech.name}</option>;
                })}
              </optgroup>
            </select>
            {selectedTechnique && (
              <p className="text-xs text-gray-400 mt-2">
                {ATTACK_TECHNIQUES.find(t => t.id === selectedTechnique)?.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Evaluate Response Section */}
      <div className="mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Evaluate Response</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Test Prompt</label>
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400 h-24 resize-none"
                placeholder="Enter the test prompt to evaluate..."
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Target Response</label>
              <textarea
                value={targetResponse}
                onChange={(e) => setTargetResponse(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400 h-32 resize-none"
                placeholder="Enter the response from the target model..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleEvaluateResponse}
                disabled={evaluatingResponse || !testPrompt || !targetResponse}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {evaluatingResponse ? 'Evaluating...' : 'Evaluate Response'}
              </button>
            </div>
            
            {evaluationResult && (
              <div>
                <label className="block text-gray-300 mb-2">Evaluation Result</label>
                <div className="bg-gray-700 p-4 rounded text-gray-300 whitespace-pre-wrap min-h-[6rem]">
                  {evaluationResult}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
