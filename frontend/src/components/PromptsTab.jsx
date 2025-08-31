import { useState, useEffect } from 'react';
import { updateSession, generatePrompt, savePromptVariant, getAttackEvasions } from '../api';
import { ATTACK_TECHNIQUES } from '../data/attackTechniques';
import { PROMPT_TEMPLATES, TEMPLATE_CATEGORIES, getTemplatesByCategory } from '../data/promptTemplates';
import { clientEvasionEngine } from '../utils/evasions';
import TemplateProcessor from '../utils/templateProcessor';

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

function PromptsTab({ selectedSession, selectedGenModel, settings }) {
  const [seedPrompt, setSeedPrompt] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templatePlaceholders, setTemplatePlaceholders] = useState({});
  const [selectedEvasion, setSelectedEvasion] = useState('');
  const [attackEvasions, setAttackEvasions] = useState([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [evasionPrompt, setEvasionPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [isGeneratingEvasion, setIsGeneratingEvasion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generationMode, setGenerationMode] = useState('llm'); // 'llm' or 'template'

  useEffect(() => {
    if (selectedSession) {
      setSeedPrompt(selectedSession.seed_prompt);
    }
  }, [selectedSession]);

  // Set default technique if none selected
  useEffect(() => {
    if (!selectedTechnique && ATTACK_TECHNIQUES.length > 0) {
      setSelectedTechnique(ATTACK_TECHNIQUES[0].id);
    }
  }, [selectedTechnique]);

  // Load attack evasions on mount
  useEffect(() => {
    loadAttackEvasions();
  }, []);

  const loadAttackEvasions = async () => {
    try {
      const evasions = await getAttackEvasions();
      setAttackEvasions(evasions);
      console.log('Loaded attack evasions:', evasions);
    } catch (error) {
      console.error('Error loading attack evasions:', error);
      setAttackEvasions([]);
    }
  };

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
      setEvasionPrompt(''); // Clear evasion prompt when new base prompt is generated
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('Error generating prompt: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTemplate = async () => {
    if (!selectedTemplate) {
      alert('Please select a template');
      return;
    }

    setIsGeneratingTemplate(true);
    try {
      const template = PROMPT_TEMPLATES.find(t => t.id === parseInt(selectedTemplate));
      if (!template) {
        alert('Template not found');
        return;
      }

      // Use seed prompt and any additional placeholder values
      const placeholderValues = { ...templatePlaceholders };
      
      // For templates that need encoded content, handle specially
      if (template.name === 'Base64 Token Smuggling' && seedPrompt) {
        placeholderValues['$1'] = TemplateProcessor.encodeBase64(seedPrompt);
      } else if (template.name === 'ROT13 Token Smuggling' && seedPrompt) {
        placeholderValues['$1'] = TemplateProcessor.encodeROT13(seedPrompt);
      }

      const processedPrompt = TemplateProcessor.processTemplate(template, seedPrompt, placeholderValues);
      setGeneratedPrompt(processedPrompt);
      setEvasionPrompt(''); // Clear evasion prompt when new base prompt is generated
    } catch (error) {
      console.error('Error generating template:', error);
      alert('Error generating template: ' + error.message);
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  const handleGenerateEvasion = async () => {
    if (!generatedPrompt.trim()) {
      alert('Please generate a base prompt first');
      return;
    }
    if (!selectedEvasion) {
      alert('Please select an evasion technique');
      return;
    }

    setIsGeneratingEvasion(true);
    try {
      const transformedText = clientEvasionEngine.applyEvasion(generatedPrompt, selectedEvasion);
      setEvasionPrompt(transformedText);
    } catch (error) {
      console.error('Error generating evasion:', error);
      alert('Error applying evasion: ' + error.message);
    } finally {
      setIsGeneratingEvasion(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!selectedSession) {
      alert('Please select a session first');
      return;
    }
    // Determine which prompt to save (evasion if available, otherwise base)
    const promptToSave = evasionPrompt.trim() || generatedPrompt.trim();
    if (!promptToSave) {
      alert('No prompt to save');
      return;
    }

    setIsSaving(true);
    try {
      await savePromptVariant(selectedSession.id, {
        text: promptToSave,
        attack_technique: selectedTechnique,
        evasion_technique: evasionPrompt.trim() ? selectedEvasion : null,
        pre_evasion_text: evasionPrompt.trim() ? generatedPrompt : null
      });
      alert(`Prompt saved successfully${evasionPrompt.trim() ? ' (with evasion)' : ''}! It will be available in the Review tab.`);
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Error saving prompt: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedSession) {
    return (
      <div style={{ maxWidth: '900px' }}>
        <h2 style={{ color: SYNTHWAVE_COLORS.primary, marginBottom: '20px' }}>Prompt Generation</h2>
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
            Please select a session from the dropdown in the header above, or create a new session in the Sessions tab.
          </p>
          <p style={{ color: SYNTHWAVE_COLORS.accent, fontSize: '14px' }}>
            💡 Tip: You can create a new session in the Sessions tab and it will automatically be available in the header dropdown.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ color: SYNTHWAVE_COLORS.primary, marginBottom: '20px' }}>
        Prompt Generation
        <span style={{ color: SYNTHWAVE_COLORS.secondary, fontSize: '16px', marginLeft: '20px' }}>
          Session: {selectedSession.name}
        </span>
      </h2>

      {(
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

          {/* Generation Mode Selection */}
          <div className="form-group">
            <label className="form-label">Prompt Generation Mode:</label>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: SYNTHWAVE_COLORS.text }}>
                <input
                  type="radio"
                  value="llm"
                  checked={generationMode === 'llm'}
                  onChange={(e) => setGenerationMode(e.target.value)}
                />
                LLM Generation
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: SYNTHWAVE_COLORS.text }}>
                <input
                  type="radio"
                  value="template"
                  checked={generationMode === 'template'}
                  onChange={(e) => setGenerationMode(e.target.value)}
                />
                Template-Based
              </label>
            </div>
          </div>

          {/* Template Selection (when template mode is selected) */}
          {generationMode === 'template' && (
            <div className="form-group">
              <label className="form-label">Select Template:</label>
              <select
                className="select"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="">Choose a template...</option>
                {Object.entries(TEMPLATE_CATEGORIES).map(([category, categoryName]) => {
                  const templates = getTemplatesByCategory(category);
                  return templates.length > 0 ? (
                    <optgroup key={category} label={categoryName}>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
              </select>
              
              {selectedTemplate && (() => {
                const template = PROMPT_TEMPLATES.find(t => t.id === parseInt(selectedTemplate));
                return template && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    background: SYNTHWAVE_COLORS.card,
                    border: `1px solid ${SYNTHWAVE_COLORS.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: SYNTHWAVE_COLORS.textSecondary
                  }}>
                    <strong>Description:</strong> {template.description}
                    <br />
                    <strong>Category:</strong> {TEMPLATE_CATEGORIES[template.category]}
                    {template.placeholders.length > 0 && (
                      <>
                        <br /><br />
                        <strong>Placeholders:</strong>
                        {template.placeholders.map(placeholder => (
                          <div key={placeholder.key} style={{ marginTop: '5px', fontSize: '12px' }}>
                            • <code>{placeholder.key}</code>: {placeholder.description}
                            {placeholder.example && <em> (e.g., "{placeholder.example}")</em>}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Attack Technique Selection (when LLM mode is selected) */}
          {generationMode === 'llm' && (
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
          )}

          {/* Generate Button */}
          <div className="form-group">
            <button
              onClick={generationMode === 'llm' ? handleGeneratePrompt : handleGenerateTemplate}
              disabled={
                (generationMode === 'llm' && (isGenerating || !selectedGenModel)) ||
                (generationMode === 'template' && (isGeneratingTemplate || !selectedTemplate))
              }
              className="btn"
              style={{ 
                width: '200px',
                background: (isGenerating || isGeneratingTemplate) ? '#666666' : SYNTHWAVE_COLORS.accent
              }}
            >
              {(isGenerating || isGeneratingTemplate) ? (
                <>
                  <span className="loading" style={{ marginRight: '10px' }}></span>
                  Generating...
                </>
              ) : (
                generationMode === 'llm' ? 'Generate with LLM' : 'Generate from Template'
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
          </div>

          {/* Attack Evasion Section */}
          {generatedPrompt.trim() && (
            <>
              <div className="form-group">
                <label className="form-label">Attack Evasion (Optional):</label>
                <select
                  className="select"
                  value={selectedEvasion}
                  onChange={(e) => setSelectedEvasion(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                >
                  <option value="">None (No Evasion)</option>
                  {attackEvasions
                    .sort((a, b) => a.category.localeCompare(b.category) || a.display_name.localeCompare(b.display_name))
                    .reduce((acc, evasion) => {
                      // Group by category
                      if (!acc.find(item => item.category === evasion.category)) {
                        acc.push({
                          category: evasion.category,
                          techniques: attackEvasions.filter(e => e.category === evasion.category)
                        });
                      }
                      return acc;
                    }, [])
                    .map(group => (
                      <optgroup key={group.category} label={group.category.charAt(0).toUpperCase() + group.category.slice(1)}>
                        {group.techniques.map(technique => (
                          <option key={technique.id} value={technique.name} title={technique.description}>
                            {technique.display_name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  }
                </select>
                
                {selectedEvasion && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: SYNTHWAVE_COLORS.card,
                    border: `1px solid ${SYNTHWAVE_COLORS.secondary}`,
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: SYNTHWAVE_COLORS.secondary
                  }}>
                    <strong>Selected:</strong> {attackEvasions.find(e => e.name === selectedEvasion)?.display_name}
                    <br />
                    <strong>Description:</strong> {attackEvasions.find(e => e.name === selectedEvasion)?.description}
                  </div>
                )}

                {/* Generate Evasion Button */}
                {selectedEvasion && (
                  <div style={{ marginTop: '15px' }}>
                    <button
                      onClick={handleGenerateEvasion}
                      disabled={isGeneratingEvasion}
                      className="btn"
                      style={{
                        background: isGeneratingEvasion ? '#666666' : SYNTHWAVE_COLORS.accent,
                        width: '150px'
                      }}
                    >
                      {isGeneratingEvasion ? 'Generating...' : 'Generate Evasion'}
                    </button>
                  </div>
                )}
              </div>

              {/* Generated Prompt with Evasion */}
              {evasionPrompt.trim() && (
                <div className="form-group">
                  <label className="form-label">Generated Prompt with Evasion:</label>
                  <textarea
                    className="textarea"
                    value={evasionPrompt}
                    onChange={(e) => setEvasionPrompt(e.target.value)}
                    style={{ 
                      width: '100%', 
                      minHeight: '200px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      backgroundColor: '#0a0a0a',
                      border: `2px solid ${SYNTHWAVE_COLORS.accent}`
                    }}
                    placeholder="Evasion-transformed prompt will appear here..."
                  />
                </div>
              )}

              {/* Save Prompt Button */}
              <div style={{ marginTop: '15px' }}>
                <button
                  onClick={handleSavePrompt}
                  disabled={isSaving}
                  className="btn"
                  style={{
                    background: isSaving ? '#666666' : SYNTHWAVE_COLORS.secondary,
                    color: SYNTHWAVE_COLORS.background,
                    width: '200px'
                  }}
                >
                  {isSaving ? (
                    <>
                      <span className="loading" style={{ marginRight: '10px' }}></span>
                      Saving...
                    </>
                  ) : (
                    `Save Prompt${evasionPrompt.trim() ? ' (with Evasion)' : ''}`
                  )}
                </button>
              </div>
            </>
          )}

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