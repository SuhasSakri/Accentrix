/**
 * Accentrix API Service
 * Handles all communication with the Node.js backend
 */

const API_BASE = 'http://localhost:3001/api';

// Helper to get auth headers
const getHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// ─── Auth ───────────────────────────────────────────────

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  return await response.json();
}

export async function registerUser(name, email, password) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  return await response.json();
}

export async function verifyUser() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Not authenticated');
  return await response.json();
}

// ─── Health ─────────────────────────────────────────────

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
}

// ─── Pronunciation ──────────────────────────────────────

export async function analyzePronunciation(audioBlob, language, referenceText) {
  const formData = new FormData();
  const audioFile = new File([audioBlob], 'recording.wav', {
    type: audioBlob.type || 'audio/wav',
  });

  formData.append('audio', audioFile);
  formData.append('language', language);
  formData.append('referenceText', referenceText);

  const response = await fetch(`${API_BASE}/pronunciation/analyze`, {
    method: 'POST',
    headers: getHeaders(true),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Server error: ${response.status}`);
  }

  return await response.json();
}

export async function getSessions(limit = 20) {
  const response = await fetch(`${API_BASE}/pronunciation/sessions?limit=${limit}`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return await response.json();
}

// ─── Progress ───────────────────────────────────────────

export async function getProgress() {
  const response = await fetch(`${API_BASE}/progress`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch progress');
  return await response.json();
}

export async function recordProgress(sessionData) {
  const response = await fetch(`${API_BASE}/progress/record`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(sessionData),
  });

  if (!response.ok) throw new Error('Failed to record progress');
  return await response.json();
}

