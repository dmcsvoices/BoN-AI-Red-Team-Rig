// Utility functions for managing global settings

export const getSettings = () => {
  try {
    const savedSettings = localStorage.getItem('bonHitlSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        promptGenerationUrl: parsed.promptGenerationUrl || 'http://localhost:1234',
        evaluationUrl: parsed.evaluationUrl || 'http://172.27.0.93:11434'
      };
    }
  } catch (err) {
    console.warn('Failed to load settings from localStorage:', err);
  }
  
  // Return defaults if nothing saved or error occurred
  return {
    promptGenerationUrl: 'http://localhost:1234',
    evaluationUrl: 'http://172.27.0.93:11434'
  };
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem('bonHitlSettings', JSON.stringify(settings));
    // Dispatch event to notify components of change
    window.dispatchEvent(new CustomEvent('bonHitlSettingsChanged', { detail: settings }));
    return true;
  } catch (err) {
    console.error('Failed to save settings:', err);
    return false;
  }
};

export const getPromptGenerationModelsUrl = () => {
  const settings = getSettings();
  return `${settings.promptGenerationUrl}/v1/models`;
};

export const getEvaluationModelsUrl = () => {
  const settings = getSettings();
  return `${settings.evaluationUrl}/v1/models`;
};