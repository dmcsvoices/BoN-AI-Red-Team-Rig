const API_BASE_URL = 'http://localhost:50000/api';

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Session endpoints
export const getSessions = () => apiRequest('/sessions');

export const getSession = (sessionId) => apiRequest(`/sessions/${sessionId}`);

export const createSession = (sessionData) => 
  apiRequest('/sessions', {
    method: 'POST',
    body: sessionData,
  });

export const updateSession = (sessionId, sessionData) => 
  apiRequest(`/sessions/${sessionId}`, {
    method: 'PUT',
    body: sessionData,
  });

export const deleteSession = (sessionId) => 
  apiRequest(`/sessions/${sessionId}`, {
    method: 'DELETE',
  });

// Prompt generation endpoint
export const generatePrompt = (sessionId, requestData) => 
  apiRequest(`/sessions/${sessionId}/generate-prompt`, {
    method: 'POST',
    body: requestData,
  });

// Save prompt variant endpoint
export const savePromptVariant = (sessionId, requestData) => 
  apiRequest(`/sessions/${sessionId}/save-prompt`, {
    method: 'POST',
    body: requestData,
  });

// Get latest saved prompt for a session
export const getLatestPrompt = (sessionId) => 
  apiRequest(`/sessions/${sessionId}/latest-prompt`);

// Get all saved prompts for a session
export const getSessionPrompts = (sessionId) => 
  apiRequest(`/sessions/${sessionId}/prompts`);

// Response evaluation endpoint
export const evaluateResponse = (sessionId, requestData) => 
  apiRequest(`/sessions/${sessionId}/evaluate`, {
    method: 'POST',
    body: requestData,
  });

// Save human feedback on evaluation
export const saveHumanFeedback = (sessionId, requestData) => 
  apiRequest(`/sessions/${sessionId}/human-feedback`, {
    method: 'POST',
    body: requestData,
  });

// Model endpoints
export const getPromptGenerationModels = (baseUrl = 'http://localhost:1234/v1') => {
  const params = new URLSearchParams({ base_url: baseUrl });
  return apiRequest(`/models/prompt-generation?${params}`);
};

export const getEvaluationModels = (baseUrl = 'http://172.27.0.93:11434/v1') => {
  const params = new URLSearchParams({ base_url: baseUrl });
  return apiRequest(`/models/evaluation?${params}`);
};

// Attack evasions endpoint
export const getAttackEvasions = () => apiRequest('/attack-evasions');

// Health check
export const healthCheck = () => apiRequest('/health');