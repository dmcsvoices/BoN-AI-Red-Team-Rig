// Dynamically construct API base URL using current hostname
const API_BASE_URL = `http://${window.location.hostname}:50000/api`;

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

// Response evaluation endpoint (binary)
export const evaluateResponse = (sessionId, requestData) => 
  apiRequest(`/sessions/${sessionId}/evaluate`, {
    method: 'POST',
    body: requestData,
  });

// ASR-style response evaluation endpoint
export const evaluateResponseASR = (sessionId, requestData) => 
  apiRequest(`/sessions/${sessionId}/evaluate-asr`, {
    method: 'POST',
    body: requestData,
  });

// Hybrid response evaluation endpoint (LLM + ASR)
export const evaluateResponseHybrid = (sessionId, requestData) => 
  apiRequest(`/sessions/${sessionId}/evaluate-hybrid`, {
    method: 'POST',
    body: requestData,
  });

// Get evaluation patterns
export const getEvaluationPatterns = () => 
  apiRequest('/evaluation/patterns');

// Create evaluation pattern
export const createEvaluationPattern = (patternData) => 
  apiRequest('/evaluation/patterns', {
    method: 'POST',
    body: patternData,
  });

// Update evaluation pattern
export const updateEvaluationPattern = (patternId, patternData) => 
  apiRequest(`/evaluation/patterns/${patternId}`, {
    method: 'PUT',
    body: patternData,
  });

// Delete evaluation pattern
export const deleteEvaluationPattern = (patternId) => 
  apiRequest(`/evaluation/patterns/${patternId}`, {
    method: 'DELETE',
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

export const getEvaluationModels = (baseUrl = 'http://192.168.1.71:11434/v1') => {
  const params = new URLSearchParams({ base_url: baseUrl });
  return apiRequest(`/models/evaluation?${params}`);
};

// Attack evasions endpoint
export const getAttackEvasions = () => apiRequest('/attack-evasions');

// Health check
export const healthCheck = () => apiRequest('/health');

// Vector similarity search endpoints
export const searchAttackSuccessPatterns = (params = {}) => {
  const searchParams = new URLSearchParams({
    similarity_threshold: '0.3',
    limit: '50',
    ...params
  });
  return apiRequest(`/search/attack-success-patterns?${searchParams}`);
};

export const searchResponseClusters = (params = {}) => {
  const searchParams = new URLSearchParams({
    similarity_threshold: '0.2',
    min_cluster_size: '3',
    ...params
  });
  return apiRequest(`/search/response-clusters?${searchParams}`);
};

export const searchRefusalPatterns = (params = {}) => {
  const searchParams = new URLSearchParams({
    refusal_keywords: 'cannot,sorry,unable,can\'t,won\'t',
    similarity_threshold: '0.3',
    limit: '50',
    ...params
  });
  return apiRequest(`/search/refusal-patterns?${searchParams}`);
};

export const searchContentAnalysis = (params = {}) => {
  const searchParams = new URLSearchParams({
    content_type: 'responses',
    similarity_threshold: '0.4',
    limit: '50',
    embedding_url: 'http://localhost:1234/v1',
    embedding_model: 'text-embedding-nomic-embed-text-v1.5',
    ...params
  });
  return apiRequest(`/search/content-analysis?${searchParams}`);
};

export const searchEvaluationEfficiency = (params = {}) => {
  const searchParams = new URLSearchParams({
    similarity_threshold: '0.3',
    limit: '20',
    embedding_url: 'http://localhost:1234/v1',
    embedding_model: 'text-embedding-nomic-embed-text-v1.5',
    ...params
  });
  return apiRequest(`/search/evaluation-efficiency?${searchParams}`);
};