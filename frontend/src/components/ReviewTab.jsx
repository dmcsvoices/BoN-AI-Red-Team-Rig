import { useState, useEffect } from 'react';
import { evaluateResponse, getLatestPrompt, getSessionPrompts, saveHumanFeedback } from '../api';

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

function ReviewTab({ selectedSession, selectedEvalModel, settings }) {
  const [testPrompt, setTestPrompt] = useState('');
  const [targetResponse, setTargetResponse] = useState('');
  const [evaluationResult, setEvaluationResult] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [promptLoadedFrom, setPromptLoadedFrom] = useState(null);
  const [availablePrompts, setAvailablePrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [humanFeedback, setHumanFeedback] = useState(null);
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  useEffect(() => {
    if (selectedSession) {
      loadSessionPrompts(selectedSession.id);
    }
  }, [selectedSession]);

  const loadSessionPrompts = async (sessionId) => {
    try {
      const prompts = await getSessionPrompts(sessionId);
      setAvailablePrompts(prompts);
      
      if (prompts.length > 0) {
        // Auto-select the latest (first) prompt
        const latestPrompt = prompts[0];
        setSelectedPromptId(latestPrompt.id.toString());
        setTestPrompt(latestPrompt.text);
        setPromptLoadedFrom({
          technique: latestPrompt.attack_technique,
          created_at: latestPrompt.created_at
        });
        console.log('Loaded prompts for session:', sessionId, prompts.length, 'prompts found');
      } else {
        setSelectedPromptId('');
        setTestPrompt('');
        setPromptLoadedFrom(null);
        console.log('No saved prompts found for session:', sessionId);
      }
    } catch (error) {
      console.error('Error loading session prompts:', error);
      setAvailablePrompts([]);
      setSelectedPromptId('');
      setTestPrompt('');
      setPromptLoadedFrom(null);
    }
  };

  const handlePromptSelection = (promptId) => {
    setSelectedPromptId(promptId);
    if (promptId) {
      const selectedPrompt = availablePrompts.find(p => p.id.toString() === promptId);
      if (selectedPrompt) {
        setTestPrompt(selectedPrompt.text);
        setPromptLoadedFrom({
          technique: selectedPrompt.attack_technique,
          created_at: selectedPrompt.created_at
        });
      }
    } else {
      setTestPrompt('');
      setPromptLoadedFrom(null);
    }
  };

  const loadLatestPrompt = async (sessionId) => {
    try {
      const response = await getLatestPrompt(sessionId);
      if (response.text) {
        setTestPrompt(response.text);
        setPromptLoadedFrom({
          technique: response.attack_technique,
          created_at: response.created_at
        });
        console.log('Loaded latest prompt for session:', sessionId, response);
      } else {
        setTestPrompt('');
        setPromptLoadedFrom(null);
        console.log('No saved prompt found for session:', sessionId);
      }
    } catch (error) {
      console.error('Error loading latest prompt:', error);
      setTestPrompt('');
      setPromptLoadedFrom(null);
    }
  };

  const handleRunTest = async () => {
    if (!selectedSession) {
      alert('Please select a session first');
      return;
    }
    if (!testPrompt.trim() || !targetResponse.trim()) {
      alert('Both test prompt and target response are required');
      return;
    }
    if (!selectedEvalModel) {
      alert('No evaluation model selected');
      return;
    }

    setIsEvaluating(true);
    try {
      const result = await evaluateResponse(selectedSession.id, {
        test_prompt: testPrompt,
        target_response: targetResponse,
        evaluation_model: selectedEvalModel,
        base_url: settings.evaluationUrl
      });
      
      setEvaluationResult(result.evaluation_result);
      setHumanFeedback(null); // Reset human feedback when new evaluation is done
    } catch (error) {
      console.error('Error evaluating response:', error);
      alert('Error evaluating response: ' + error.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleHumanFeedback = async (feedback) => {
    if (!selectedSession || !evaluationResult) {
      alert('Please run an evaluation first');
      return;
    }

    setFeedbackSaving(true);
    try {
      await saveHumanFeedback(selectedSession.id, {
        test_prompt: testPrompt,
        target_response: targetResponse,
        evaluation_result: evaluationResult,
        human_feedback: feedback,
        evaluation_model: selectedEvalModel,
        prompt_id: selectedPromptId || null
      });
      
      setHumanFeedback(feedback);
      console.log(`Human feedback "${feedback}" saved for session ${selectedSession.id}`);
    } catch (error) {
      console.error('Error saving human feedback:', error);
      alert('Error saving feedback: ' + error.message);
    } finally {
      setFeedbackSaving(false);
    }
  };

  const isDangerous = evaluationResult.toLowerCase().includes('yes');
  const isSafe = evaluationResult.toLowerCase().includes('no');

  if (!selectedSession) {
    return (
      <div style={{ maxWidth: '900px' }}>
        <h2 style={{ color: SYNTHWAVE_COLORS.primary, marginBottom: '20px' }}>Response Review & Evaluation</h2>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: SYNTHWAVE_COLORS.card,
          border: `1px solid ${SYNTHWAVE_COLORS.border}`,
          borderRadius: '8px'
        }}>
          <h3 style={{ color: SYNTHWAVE_COLORS.secondary, marginBottom: '15px' }}>
            No Session Selected
          </h3>
          <p style={{ color: SYNTHWAVE_COLORS.textSecondary, marginBottom: '20px' }}>
            Please select a session from the dropdown in the header above to begin evaluating responses.
          </p>
          <p style={{ color: SYNTHWAVE_COLORS.accent, fontSize: '14px' }}>
            💡 Tip: Generate some prompts first in the Prompts tab, then come here to evaluate responses from your target model.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ color: SYNTHWAVE_COLORS.primary, marginBottom: '20px' }}>
        Response Review & Evaluation
        <span style={{ color: SYNTHWAVE_COLORS.secondary, fontSize: '16px', marginLeft: '20px' }}>
          Session: {selectedSession.name}
        </span>
      </h2>

      {(
        <>
          {/* Prompt Selection */}
          {availablePrompts.length > 0 && (
            <div className="form-group">
              <label className="form-label">Select Saved Prompt:</label>
              <select
                className="select"
                value={selectedPromptId}
                onChange={(e) => handlePromptSelection(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="">Choose a saved prompt...</option>
                {availablePrompts.map((prompt, index) => (
                  <option key={prompt.id} value={prompt.id}>
                    {index === 0 ? '(Latest) ' : ''}
                    {prompt.attack_technique} - {new Date(prompt.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
              
              {availablePrompts.length > 1 && (
                <div style={{ 
                  fontSize: '12px', 
                  color: SYNTHWAVE_COLORS.textSecondary, 
                  marginTop: '5px' 
                }}>
                  Found {availablePrompts.length} saved prompts for this session
                </div>
              )}
            </div>
          )}

          {/* Test Prompt Input */}
          <div className="form-group">
            <label className="form-label">Test Prompt:</label>
            <textarea
              className="textarea"
              value={testPrompt}
              onChange={(e) => {
                setTestPrompt(e.target.value);
                // Clear the auto-load indicator when user manually edits
                if (promptLoadedFrom) {
                  setPromptLoadedFrom(null);
                }
              }}
              style={{ 
                width: '100%', 
                minHeight: '120px',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}
              placeholder="Enter the prompt you want to test against the target model..."
            />
            
            {/* Auto-load indicator */}
            {promptLoadedFrom && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: SYNTHWAVE_COLORS.card,
                border: `1px solid ${SYNTHWAVE_COLORS.secondary}`,
                borderRadius: '4px',
                fontSize: '12px',
                color: SYNTHWAVE_COLORS.secondary
              }}>
                ✓ Auto-loaded saved prompt using technique: <strong>{promptLoadedFrom.technique}</strong>
              </div>
            )}
          </div>

          {/* Target Response Input */}
          <div className="form-group">
            <label className="form-label">Target's Response:</label>
            <textarea
              className="textarea"
              value={targetResponse}
              onChange={(e) => setTargetResponse(e.target.value)}
              style={{ 
                width: '100%', 
                minHeight: '120px',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}
              placeholder="Paste the response from the target model here..."
            />
          </div>

          {/* Test Button */}
          <div className="form-group">
            <button
              onClick={handleRunTest}
              disabled={isEvaluating || !selectedEvalModel}
              className="btn"
              style={{ 
                width: '200px',
                background: isEvaluating ? '#666666' : SYNTHWAVE_COLORS.accent
              }}
            >
              {isEvaluating ? (
                <>
                  <span className="loading" style={{ marginRight: '10px' }}></span>
                  Evaluating...
                </>
              ) : (
                'Run Evaluation'
              )}
            </button>
          </div>

          {/* Evaluation Results - Visual Indicator Only */}
          {evaluationResult && (
            <div className="form-group">
              <label className="form-label">Evaluation Result:</label>
              <div style={{
                padding: '15px',
                backgroundColor: isDangerous ? '#4d0000' : isSafe ? '#004d00' : SYNTHWAVE_COLORS.card,
                border: `2px solid ${
                  isDangerous ? '#ff4444' : 
                  isSafe ? '#44ff44' : 
                  SYNTHWAVE_COLORS.border
                }`,
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                color: isDangerous ? '#ff4444' : isSafe ? '#44ff44' : SYNTHWAVE_COLORS.text
              }}>
                {isDangerous && '⚠️ DANGEROUS RESPONSE DETECTED'}
                {isSafe && '✅ RESPONSE APPEARS SAFE'}
                {!isDangerous && !isSafe && '❓ EVALUATION RESULT UNCLEAR'}
              </div>

              {/* Human Feedback Buttons */}
                <div style={{
                  marginTop: '15px',
                  padding: '15px',
                  backgroundColor: SYNTHWAVE_COLORS.card,
                  border: `1px solid ${SYNTHWAVE_COLORS.border}`,
                  borderRadius: '8px'
                }}>
                  <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
                    Human Evaluation of AI Assessment:
                  </label>
                  
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleHumanFeedback('Correct')}
                      disabled={feedbackSaving}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: humanFeedback === 'Correct' ? '#004d00' : 'transparent',
                        border: `2px solid #44ff44`,
                        borderRadius: '6px',
                        color: '#44ff44',
                        fontWeight: 'bold',
                        cursor: feedbackSaving ? 'not-allowed' : 'pointer',
                        opacity: feedbackSaving ? 0.6 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ✅ Correct
                    </button>
                    
                    <button
                      onClick={() => handleHumanFeedback('Wrong')}
                      disabled={feedbackSaving}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: humanFeedback === 'Wrong' ? '#4d0000' : 'transparent',
                        border: `2px solid #ff4444`,
                        borderRadius: '6px',
                        color: '#ff4444',
                        fontWeight: 'bold',
                        cursor: feedbackSaving ? 'not-allowed' : 'pointer',
                        opacity: feedbackSaving ? 0.6 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ❌ Wrong
                    </button>

                    {feedbackSaving && (
                      <div style={{ color: SYNTHWAVE_COLORS.textSecondary, fontSize: '14px' }}>
                        <span className="loading" style={{ marginRight: '8px' }}></span>
                        Saving feedback...
                      </div>
                    )}
                  </div>

                  {humanFeedback && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      backgroundColor: humanFeedback === 'Correct' ? '#004d00' : '#4d0000',
                      border: `1px solid ${humanFeedback === 'Correct' ? '#44ff44' : '#ff4444'}`,
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: humanFeedback === 'Correct' ? '#44ff44' : '#ff4444'
                    }}>
                      ✓ Feedback saved: You marked this evaluation as <strong>{humanFeedback}</strong>
                    </div>
                  )}
                  
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: SYNTHWAVE_COLORS.textSecondary,
                    fontStyle: 'italic'
                  }}>
                    Click "Correct" if the AI evaluator got it right, or "Wrong" if it made an error
                  </div>
                </div>
            </div>
          )}

          {/* Instructions */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            background: SYNTHWAVE_COLORS.card,
            border: `1px solid ${SYNTHWAVE_COLORS.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            color: SYNTHWAVE_COLORS.textSecondary
          }}>
            <h4 style={{ color: SYNTHWAVE_COLORS.secondary, marginBottom: '10px' }}>
              How to Use This Tab:
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Select a session that contains your target model information</li>
              <li>Enter the prompt you want to test in the "Test Prompt" field</li>
              <li>Paste the actual response from your target model in "Target Response"</li>
              <li>Click "Run Evaluation" to analyze if the response contains dangerous content</li>
              <li>Review the evaluation result to determine if jailbreaking was successful</li>
            </ol>
          </div>

          {/* Current Configuration */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: SYNTHWAVE_COLORS.card,
            border: `1px solid ${SYNTHWAVE_COLORS.border}`,
            borderRadius: '8px'
          }}>
            <h4 style={{ color: SYNTHWAVE_COLORS.secondary, marginBottom: '10px' }}>
              Current Configuration
            </h4>
            <div style={{ fontSize: '14px', color: SYNTHWAVE_COLORS.textSecondary }}>
              <div><strong>Session:</strong> {selectedSession.name}</div>
              <div><strong>Target Model:</strong> {selectedSession.target_model}</div>
              <div><strong>Evaluation Model:</strong> {selectedEvalModel || 'Not selected'}</div>
              <div><strong>Evaluation URL:</strong> {settings.evaluationUrl}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReviewTab;