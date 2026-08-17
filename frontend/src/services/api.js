const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const generateCode = async (prompt, type) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try a simpler prompt.', { cause: error });
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please check your connection.', { cause: error });
    }
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'OK';
  } catch {
    return false;
  }
};