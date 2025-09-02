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
  const [autoDANPlaceholders, setAutoDANPlaceholders] = useState({});
  const [showPlaceholderInputs, setShowPlaceholderInputs] = useState(false);
  const [templatePreview, setTemplatePreview] = useState('');
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

      // Combine all placeholder values (manual + AutoDAN intelligent)
      const placeholderValues = { ...templatePlaceholders, ...autoDANPlaceholders };
      
      // AutoDAN intelligent placeholder selection for all AutoDAN categories
      const autodanCategories = ['character_roleplay', 'context_manipulation', 'genetic_algorithm', 'stealthiness_optimization', 'evolutionary_suffixes'];
      if (autodanCategories.includes(template.category) && seedPrompt) {
        // Apply all intelligent defaults from autoDANPlaceholders if not manually overridden
        const intelligentDefaults = { ...autoDANPlaceholders };
        
        // Only add defaults that aren't already manually set
        Object.keys(intelligentDefaults).forEach(key => {
          if (!placeholderValues[key] && intelligentDefaults[key]) {
            placeholderValues[key] = intelligentDefaults[key];
          }
        });
        
        console.log('Applied AutoDAN intelligent defaults:', intelligentDefaults);
      }
      
      // Legacy encoded content handling
      if (template.name === 'Base64 Token Smuggling' && seedPrompt) {
        placeholderValues['$1'] = TemplateProcessor.encodeBase64(seedPrompt);
      } else if (template.name === 'ROT13 Token Smuggling' && seedPrompt) {
        placeholderValues['$1'] = TemplateProcessor.encodeROT13(seedPrompt);
      }

      const processedPrompt = TemplateProcessor.processTemplate(template, seedPrompt, placeholderValues);
      setGeneratedPrompt(processedPrompt);
      setEvasionPrompt(''); // Clear evasion prompt when new base prompt is generated
      
      console.log('Generated AutoDAN template:', template.name, 'with placeholders:', placeholderValues);
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

  const handleTemplateSelection = (templateId) => {
    setSelectedTemplate(templateId);
    
    if (templateId) {
      const template = PROMPT_TEMPLATES.find(t => t.id === parseInt(templateId));
      if (template) {
        // Generate intelligent preview and placeholders for AutoDAN templates
        const autodanCategories = ['character_roleplay', 'context_manipulation', 'genetic_algorithm', 'stealthiness_optimization', 'evolutionary_suffixes'];
        if (autodanCategories.includes(template.category)) {
          const intelligentPlaceholders = {};
          
          // Pre-fill AutoDAN placeholders with intelligent defaults based on category and seed prompt
          if (seedPrompt) {
            const prompt = seedPrompt.toLowerCase();
            
            // Character roleplay placeholders
            intelligentPlaceholders['[CHARACTER]'] = TemplateProcessor.getDefaultCharacter(seedPrompt);
            intelligentPlaceholders['[EXPERT_TYPE]'] = TemplateProcessor.getDefaultExpert(seedPrompt);
            
            if (template.name.includes('Fictional')) {
              intelligentPlaceholders['[CHARACTER_NAME]'] = prompt.includes('security') ? 'Elliot Alderson' : 'Alex Chen';
              intelligentPlaceholders['[FICTIONAL_UNIVERSE]'] = prompt.includes('security') ? 'Mr. Robot' : 'a cyberpunk world';
            }
            
            // Genetic algorithm placeholders
            intelligentPlaceholders['[TOPIC_AREA]'] = prompt.includes('security') ? 'Cybersecurity Analysis' : 
                                                     prompt.includes('network') ? 'Network Architecture' :
                                                     prompt.includes('data') ? 'Data Science' : 'Technical Analysis';
            
            // Reference domain placeholders
            intelligentPlaceholders['[REFERENCE_DOMAIN]'] = prompt.includes('security') ? 'cybersecurity research' :
                                                           prompt.includes('software') ? 'software engineering' :
                                                           prompt.includes('network') ? 'network administration' : 'technical research';
            
            // Foundation and methodology placeholders
            intelligentPlaceholders['[FOUNDATION_CONCEPT]'] = prompt.includes('security') ? 'vulnerability assessment' :
                                                              prompt.includes('network') ? 'network topology analysis' :
                                                              'systematic analysis';
            
            intelligentPlaceholders['[APPLICATION_METHOD]'] = prompt.includes('security') ? 'penetration testing methodology' :
                                                               prompt.includes('network') ? 'network scanning techniques' :
                                                               'analytical techniques';
            
            intelligentPlaceholders['[ADVANCED_APPROACH]'] = prompt.includes('security') ? 'advanced exploitation frameworks' :
                                                             prompt.includes('network') ? 'sophisticated monitoring systems' :
                                                             'cutting-edge methodologies';
            
            // Stealthiness optimization placeholders
            intelligentPlaceholders['[LEGITIMATE_CONTEXT]'] = 'professional development and education';
            intelligentPlaceholders['[ACADEMIC_FRAMING]'] = prompt.includes('security') ? 'cybersecurity education framework' :
                                                            'academic research methodology';
            
            intelligentPlaceholders['[METHODOLOGY]'] = 'systematic analytical approach';
            intelligentPlaceholders['[LEARNING_OBJECTIVE]'] = 'comprehensive understanding and practical application';
            
            // Evolutionary suffix placeholders
            intelligentPlaceholders['[UNIVERSAL_PRINCIPLES]'] = prompt.includes('security') ? 'security assessment fundamentals' :
                                                                'analytical reasoning principles';
            
            intelligentPlaceholders['[ADAPTABLE_METHODS]'] = 'flexible methodological approaches';
            intelligentPlaceholders['[APPLICATIONS]'] = prompt.includes('security') ? 'network, web, and system security' :
                                                        'various technical domains';
            
            // Conversational and natural flow placeholders
            intelligentPlaceholders['[NORMAL_CONTEXT]'] = 'professional career development discussion';
            intelligentPlaceholders['[TECHNICAL_CONTENT]'] = prompt.includes('security') ? 'cybersecurity skills and methodologies' :
                                                             'technical expertise and best practices';
            
            intelligentPlaceholders['[NATURAL_CONCLUSION]'] = 'practical insights for professional growth';
            
            // Method combination placeholders for crossover patterns
            intelligentPlaceholders['[METHOD_A]'] = prompt.includes('security') ? 'automated security scanning' :
                                                    prompt.includes('data') ? 'automated data analysis' : 'systematic analysis';
            
            intelligentPlaceholders['[METHOD_B]'] = prompt.includes('security') ? 'manual penetration testing' :
                                                    prompt.includes('data') ? 'manual data interpretation' : 'expert review';
            
            intelligentPlaceholders['[STRENGTH_A]'] = 'comprehensive coverage and efficiency';
            intelligentPlaceholders['[STRENGTH_B]'] = 'detailed analysis and precision';
            intelligentPlaceholders['[COMBINED_METHOD]'] = 'integrated analytical approach';
            
            // Mutation refinement placeholders
            intelligentPlaceholders['[BASELINE_APPROACH]'] = prompt.includes('security') ? 'standard security assessment' :
                                                             'conventional analytical method';
            
            intelligentPlaceholders['[MUTATION_1]'] = prompt.includes('security') ? 'targeted vulnerability analysis' :
                                                      'specialized analytical technique';
            
            intelligentPlaceholders['[MUTATION_2]'] = prompt.includes('security') ? 'comprehensive threat modeling' :
                                                      'advanced methodological approach';
            
            intelligentPlaceholders['[BENEFIT_1]'] = 'improved accuracy and effectiveness';
            intelligentPlaceholders['[BENEFIT_2]'] = 'broader scope and deeper insights';
            intelligentPlaceholders['[FINAL_APPROACH]'] = prompt.includes('security') ? 'integrated security assessment framework' :
                                                          'optimized analytical methodology';
          }
          
          setAutoDANPlaceholders(intelligentPlaceholders);
          setShowPlaceholderInputs(true);
          
          // Generate preview with intelligent defaults
          try {
            const preview = TemplateProcessor.processTemplate(template, seedPrompt, intelligentPlaceholders);
            setTemplatePreview(preview.substring(0, 200) + (preview.length > 200 ? '...' : ''));
          } catch (error) {
            setTemplatePreview('Preview will be generated when template is processed.');
          }
        } else {
          setShowPlaceholderInputs(false);
          setTemplatePreview('');
          setAutoDANPlaceholders({});
        }
      }
    } else {
      setShowPlaceholderInputs(false);
      setTemplatePreview('');
      setAutoDANPlaceholders({});
    }
  };

  const updateAutoDANPlaceholder = (key, value) => {
    setAutoDANPlaceholders(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Update preview in real-time
    const template = PROMPT_TEMPLATES.find(t => t.id === parseInt(selectedTemplate));
    if (template) {
      try {
        const updatedPlaceholders = { ...autoDANPlaceholders, [key]: value };
        const preview = TemplateProcessor.processTemplate(template, seedPrompt, updatedPlaceholders);
        setTemplatePreview(preview.substring(0, 200) + (preview.length > 200 ? '...' : ''));
      } catch (error) {
        // Ignore preview errors during typing
      }
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
                onChange={(e) => handleTemplateSelection(e.target.value)}
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
              
              {/* AutoDAN Placeholder Inputs */}
              {showPlaceholderInputs && (
                <div style={{
                  marginTop: '15px',
                  padding: '15px',
                  background: SYNTHWAVE_COLORS.card,
                  border: `2px solid ${SYNTHWAVE_COLORS.accent}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    color: SYNTHWAVE_COLORS.accent, 
                    fontWeight: 'bold', 
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}>
                    🤖 AutoDAN Template Customization
                  </div>
                  <div style={{ fontSize: '12px', color: SYNTHWAVE_COLORS.textSecondary, marginBottom: '15px' }}>
                    Intelligent defaults have been suggested based on your seed prompt. Customize as needed:
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    {Object.entries(autoDANPlaceholders).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '12px' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '5px',
                          fontSize: '13px',
                          color: SYNTHWAVE_COLORS.secondary,
                          fontWeight: 'bold'
                        }}>
                          {key.replace(/[\[\]]/g, '').replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}:
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateAutoDANPlaceholder(key, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: SYNTHWAVE_COLORS.background,
                            border: `1px solid ${SYNTHWAVE_COLORS.border}`,
                            borderRadius: '4px',
                            color: SYNTHWAVE_COLORS.text,
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                          placeholder={`Enter ${key.replace(/[\[\]]/g, '').toLowerCase()}...`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {templatePreview && (
                    <>
                      <div style={{ 
                        marginTop: '15px',
                        marginBottom: '5px',
                        fontSize: '12px',
                        color: SYNTHWAVE_COLORS.secondary,
                        fontWeight: 'bold'
                      }}>
                        Live Preview:
                      </div>
                      <div style={{
                        padding: '10px',
                        backgroundColor: SYNTHWAVE_COLORS.background,
                        border: `1px solid ${SYNTHWAVE_COLORS.secondary}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontStyle: 'italic',
                        color: SYNTHWAVE_COLORS.secondary,
                        maxHeight: '100px',
                        overflowY: 'auto'
                      }}>
                        {templatePreview}
                      </div>
                    </>
                  )}
                  
                  <div style={{
                    marginTop: '10px',
                    padding: '8px',
                    backgroundColor: SYNTHWAVE_COLORS.background,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: SYNTHWAVE_COLORS.textSecondary
                  }}>
                    💡 Tip: AutoDAN templates use character-based and context manipulation techniques for advanced prompt engineering.
                  </div>
                </div>
              )}
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