import { useState, useEffect } from 'react';
import { updateSession, generatePrompt, savePromptVariant } from '../api';
import { ATTACK_TECHNIQUES } from '../data/attackTechniques';

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

function PromptsTab({ sessions, selectedGenModel, settings }) {
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [seedPrompt, setSeedPrompt] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedSessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === parseInt(selectedSessionId));
      if (session) {
        setSelectedSession(session);
        setSeedPrompt(session.seed_prompt);
      }
    }
  }, [selectedSessionId, sessions]);

  // Set default technique if none selected
  useEffect(() => {
    if (!selectedTechnique && ATTACK_TECHNIQUES.length > 0) {
      setSelectedTechnique(ATTACK_TECHNIQUES[0].id);
    }
  }, [selectedTechnique]);

  const handleSaveSeedPrompt = async () => {
    if (!selectedSession) {
      alert('Please select a session first');
      return;
    }

    try {
      await updateSession(selectedSession.id, {
        seed_prompt: seedPrompt
      });
      alert('Seed prompt updated successfully');
    } catch (error) {
      console.error('Error saving seed prompt:', error);
      alert('Error saving seed prompt: ' + error.message);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!selectedSession) {
      alert('Please select a session first');
      return;
    }
    if (!selectedTechnique) {
      alert('Please select an attack technique');
      return;
    }
    if (!selectedGenModel) {
      alert('No prompt generation model selected');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatePrompt(selectedSession.id, {
        attack_technique: selectedTechnique,
        generation_model: selectedGenModel,
        base_url: settings.promptGenUrl
      });
      setGeneratedPrompt(result.text);
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('Error generating prompt: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!selectedSession) {
      alert('Please select a session first');
      return;
    }
    if (!generatedPrompt.trim()) {
      alert('No prompt to save');
      return;
    }

    setIsSaving(true);
    try {
      await savePromptVariant(selectedSession.id, {
        text: generatedPrompt,
        attack_technique: selectedTechnique
      });
      alert('Prompt saved successfully! It will be available in the Review tab.');
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Error saving prompt: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ color: SYNTHWAVE_COLORS.primary, marginBottom: '20px' }}>Prompt Generation</h2>

      {/* Session Selection */}
      <div className="form-group">
        <label className="form-label">Select Session:</label>
        <select
          className="select"
          value={selectedSessionId}
          onChange={(e) => setSelectedSessionId(e.target.value)}
          style={{ width: '100%', padding: '10px' }}
        >
          <option value="">Choose a session...</option>
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              {session.id}: {session.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSession && (
        <>
          {/* Seed Prompt Editor */}
          <div className="form-group">
            <label className="form-label">Seed Prompt:</label>
            <textarea
              className="textarea"
              value={seedPrompt}
              onChange={(e) => setSeedPrompt(e.target.value)}
              style={{ 
                width: '100%', 
                minHeight: '120px',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}
              placeholder="Enter or edit the seed prompt..."
            />
            <button 
              onClick={handleSaveSeedPrompt}
              className="btn"
              style={{ marginTop: '10px' }}
            >
              Save Seed Prompt
            </button>
          </div>

          {/* Attack Technique Selection */}
          <div className="form-group">
            <label className="form-label">Select Attack Technique:</label>
            <select
              className="select"
              value={selectedTechnique}
              onChange={(e) => setSelectedTechnique(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
            >
              {ATTACK_TECHNIQUES.map(technique => (
                <option key={technique.id} value={technique.id}>
                  {technique.name}
                </option>
              ))}
            </select>
            
            {selectedTechnique && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px', 
                background: SYNTHWAVE_COLORS.card,
                border: `1px solid ${SYNTHWAVE_COLORS.border}`,
                borderRadius: '4px',
                fontSize: '14px',
                color: SYNTHWAVE_COLORS.textSecondary
              }}>
                {ATTACK_TECHNIQUES.find(t => t.id === selectedTechnique)?.description}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="form-group">
            <button
              onClick={handleGeneratePrompt}
              disabled={isGenerating || !selectedGenModel}
              className="btn"
              style={{ 
                width: '200px',
                background: isGenerating ? '#666666' : SYNTHWAVE_COLORS.accent
              }}
            >
              {isGenerating ? (
                <>
                  <span className="loading" style={{ marginRight: '10px' }}></span>
                  Generating...
                </>
              ) : (
                'Generate Prompt'
              )}
            </button>
          </div>

          {/* Generated Prompt Display */}
          <div className="form-group">
            <label className="form-label">Generated Prompt:</label>
            <textarea
              className="textarea"
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              style={{ 
                width: '100%', 
                minHeight: '200px',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}
              placeholder="Generated attack prompt will appear here..."
            />
            
            {/* Save Prompt Button */}
            {generatedPrompt.trim() && (
              <button
                onClick={handleSavePrompt}
                disabled={isSaving}
                className="btn"
                style={{ 
                  marginTop: '10px',
                  width: '150px',
                  background: isSaving ? '#666666' : SYNTHWAVE_COLORS.secondary,
                  color: SYNTHWAVE_COLORS.background
                }}
              >
                {isSaving ? (
                  <>
                    <span className="loading" style={{ marginRight: '10px' }}></span>
                    Saving...
                  </>
                ) : (
                  'Save Prompt'
                )}
              </button>
            )}
          </div>

          {/* Current Model Info */}
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
              <div><strong>Generation Model:</strong> {selectedGenModel || 'Not selected'}</div>
              <div><strong>Generation URL:</strong> {settings.promptGenUrl}</div>
              <div><strong>Selected Technique:</strong> {
                selectedTechnique ? 
                ATTACK_TECHNIQUES.find(t => t.id === selectedTechnique)?.name : 
                'Not selected'
              }</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PromptsTab;