import axios from 'axios';

const API_URL = 'http://localhost:8010/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  const response = await api.post('/users/token/', { username, password });
  return response.data;
};

export const fetchPasses = async () => {
  const response = await api.get('/passes/passes/');
  return response.data;
};

export const fetchDepartments = async () => {
  const response = await api.get('/passes/departments/');
  return response.data;
};

export const fetchTemplates = async () => {
  const response = await api.get('/passes/templates/');
  return response.data;
};

export const createPass = async (passData) => {
  const response = await api.post('/passes/passes/', passData);
  return response.data;
};

export const generateDocument = async (passId) => {
  const response = await api.post(`/passes/passes/${passId}/generate_document/`);
  return response.data;
};

export const sendEmail = async (passId) => {
  const response = await api.post(`/passes/passes/${passId}/send_email/`);
  return response.data;
};

export const printPass = async (passId) => {
  const response = await api.post(`/passes/passes/${passId}/print/`);
  return response.data;
};

export const downloadPass = async (passId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/passes/passes/${passId}/download/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    // Get the blob from the response
    const blob = await response.blob();
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = url;
    link.download = `pass_${passId}.docx`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
};

export const performAction = async (passId, action) => {
  const response = await api.post('/passes/passes/perform_action/', { pass_id: passId, action });
  return response.data;
};

export default api; 