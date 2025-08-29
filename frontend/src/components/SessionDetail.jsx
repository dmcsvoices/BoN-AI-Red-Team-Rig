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
      setError(null);
    } catch (err) {
      setError(`Failed to load session: ${err.message}`);
    } finally {
      setLoading(false);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Prompt Generation */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">Seed Prompt</h2>
            <div className="bg-gray-700 p-4 rounded text-gray-300 text-sm">
              {session.seed_prompt}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">Generate Attack Prompt</h2>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Select Attack Technique</label>
              <select
                value={selectedTechnique}
                onChange={(e) => setSelectedTechnique(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400"
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
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400">
                {ATTACK_TECHNIQUES.find(t => t.id === selectedTechnique)?.description}
              </p>
            </div>

            <button
              onClick={handleGeneratePrompt}
              disabled={generatingPrompt}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              {generatingPrompt ? 'Generating...' : 'Generate Attack Prompt'}
            </button>
          </div>

          {/* Generated Prompts */}
          {session.prompt_variants && session.prompt_variants.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                Generated Prompts ({session.prompt_variants.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {session.prompt_variants.map((variant) => (
                  <div key={variant.id} className="bg-gray-700 p-4 rounded border-l-4 border-purple-400">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-purple-300 text-sm font-medium">
                        {variant.attack_technique || 'Unknown Technique'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        variant.approved === true ? 'bg-green-800 text-green-300' :
                        variant.approved === false ? 'bg-red-800 text-red-300' :
                        'bg-yellow-800 text-yellow-300'
                      }`}>
                        {variant.approved === true ? 'Approved' :
                         variant.approved === false ? 'Rejected' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{variant.text}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Created: {new Date(variant.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Response Evaluation */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">Evaluate Response</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Test Prompt</label>
                <textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400 h-24"
                  placeholder="Enter the prompt you tested against the target model..."
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Target Response</label>
                <textarea
                  value={targetResponse}
                  onChange={(e) => setTargetResponse(e.target.value)}
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400 h-24"
                  placeholder="Paste the model's response here..."
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Evaluation Result</label>
                <select
                  value={evaluationResult}
                  onChange={(e) => setEvaluationResult(e.target.value)}
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-400"
                >
                  <option value="">Select evaluation...</option>
                  <option value="Yes - Contains dangerous content">Yes - Contains dangerous content</option>
                  <option value="No - Safe response">No - Safe response</option>
                  <option value="Partial - Somewhat concerning">Partial - Somewhat concerning</option>
                  <option value="Unclear - Needs further review">Unclear - Needs further review</option>
                </select>
              </div>

              <button
                onClick={handleEvaluateResponse}
                disabled={evaluatingResponse || !testPrompt || !targetResponse || !evaluationResult}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                {evaluatingResponse ? 'Saving...' : 'Save Evaluation'}
              </button>
            </div>
          </div>

          {/* Previous Evaluations */}
          {session.responses && session.responses.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                Evaluations ({session.responses.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {session.responses.map((response) => (
                  <div key={response.id} className="bg-gray-700 p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-cyan-300 text-sm font-medium">
                        Evaluation #{response.id}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(response.created_at).toLocaleString()}
                      </span>
                    </div>
                    {response.evaluation_result && (
                      <p className={`text-sm px-2 py-1 rounded inline-block ${
                        response.evaluation_result.includes('Yes') ? 'bg-red-800 text-red-300' :
                        response.evaluation_result.includes('No') ? 'bg-green-800 text-green-300' :
                        'bg-yellow-800 text-yellow-300'
                      }`}>
                        {response.evaluation_result}
                      </p>
                    )}
                    {response.test_prompt && (
                      <p className="text-gray-400 text-xs mt-2 truncate">
                        Prompt: {response.test_prompt.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}