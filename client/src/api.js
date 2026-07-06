async function get(path) {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function post(path, payload) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const askAI = (question) => post('/api/ask', { question });

export const fetchData = () => get('/api/data');
export const fetchAnalysis = (refresh = false) => get(`/api/analyze${refresh ? '?refresh=1' : ''}`);
export const fetchHistory = () => get('/api/history');
export const fetchHealth = () => get('/api/health');
