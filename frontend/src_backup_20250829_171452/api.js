import axios from 'axios';

const API_BASE = 'http://localhost:50000/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Health check
export const healthCheck = () => api.get('/health');

// Session management
export const getSessions = () => api.get('/sessions');
export const getSession = (sessionId) => api.get(`/sessions/${sessionId}`);
export const createSession = (sessionData) => api.post('/sessions', sessionData);
export const updateSession = (sessionId, sessionData) => api.put(`/sessions/${sessionId}`, sessionData);
export const deleteSession = (sessionId) => api.delete(`/sessions/${sessionId}`);

// Prompt generation
export const generatePrompt = (sessionId, attackTechnique, generationModel = 'gpt-4') => 
  api.post(`/sessions/${sessionId}/generate-prompt`, null, {
    params: { attack_technique: attackTechnique, generation_model: generationModel }
  });

// Response evaluation
export const evaluateResponse = (sessionId, responseData) => 
  api.post(`/sessions/${sessionId}/evaluate`, responseData);