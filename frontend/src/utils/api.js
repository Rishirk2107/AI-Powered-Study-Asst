// API utility for making authenticated requests
const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers: defaultHeaders
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
};

// Helper functions for common HTTP methods
export const apiGet = (endpoint) => apiCall(endpoint);
export const apiPost = (endpoint, data) => apiCall(endpoint, {
  method: 'POST',
  body: JSON.stringify(data)
});
export const apiPut = (endpoint, data) => apiCall(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const apiDelete = (endpoint) => apiCall(endpoint, {
  method: 'DELETE'
});

// For file uploads
export const apiUpload = async (endpoint, formData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Upload failed');
  }
  
  return response.json();
};

// Schedule-specific helpers
export const generateAISchedule = (userMessage) => apiPost('/schedule/generate', { userMessage });
export const getSchedule = () => apiGet('/schedule');
export const saveSchedule = (schedule) => apiPost('/schedule/save', { schedule }); 