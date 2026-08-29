import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';
import { getThemedSystemPrompt } from '../aiPrompt.js';

const router = Router();


const DEFAULT_AI_CONFIG = {
  provider: 'openai_compatible',
  baseUrl: 'http://localhost:1234/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.7
};

export const AI_PRESETS = [
  { id: 'lmstudio', name: 'LM Studio (Local)', provider: 'openai_compatible', baseUrl: 'http://127.0.0.1:1234/v1', model: 'default', apiKey: '' },
  { id: 'ollama', name: 'Ollama (Local)', provider: 'ollama', baseUrl: 'http://127.0.0.1:11434', model: 'llama3.2', apiKey: '' },
  { id: 'chatgpt', name: 'OpenAI (ChatGPT)', provider: 'openai_compatible', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiKey: '' },
  { id: 'deepseek', name: 'DeepSeek', provider: 'openai_compatible', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', apiKey: '' },
  { id: 'gemini', name: 'Google Gemini', provider: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com', model: 'gemini-1.5-flash', apiKey: '' },
  { id: 'openrouter', name: 'OpenRouter', provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'meta-llama/llama-3.3-70b-instruct', apiKey: '' }
];

export function getStoredConfig() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'ai_config'").get();
  if (row && row.value) {
    try {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(row.value) };
    } catch {}
  }
  return DEFAULT_AI_CONFIG;
}

router.get('/ai/config', requireAuth, (req, res) => {
  try {
    const config = getStoredConfig();
    const masked = {
      ...config,
      apiKeyMasked: config.apiKey ? `${config.apiKey.slice(0, 4)}••••${config.apiKey.slice(-4)}` : '',
      hasApiKey: Boolean(config.apiKey)
    };
    res.json({ config: masked, presets: AI_PRESETS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai/config', requireAuth, (req, res) => {
  try {
    const current = getStoredConfig();
    const updates = req.body || {};
    let apiKey = updates.apiKey !== undefined ? updates.apiKey : current.apiKey;
    if (apiKey === 'KEEP' || apiKey === '••••••••') {
      apiKey = current.apiKey;
    }

    const merged = { ...current, ...updates, apiKey: apiKey || '' };
    db.prepare(`
      INSERT INTO settings (key, value) VALUES ('ai_config', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(JSON.stringify(merged));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai/test', requireAuth, async (req, res) => {
  try {
    const config = { ...getStoredConfig(), ...(req.body || {}) };
    const response = await callLLM(config, [
      { role: 'system', content: 'You are a test assistant. Answer in one short sentence.' },
      { role: 'user', content: 'Respond with "Connection successful!" if you can read this.' }
    ]);
    res.json({ success: true, message: response });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/ai/models', requireAuth, async (req, res) => {
  try {
    const config = { ...getStoredConfig(), ...(req.body || {}) };
    const { provider, baseUrl, apiKey } = config;

    if (provider === 'ollama') {
      let cleanUrl = (baseUrl || 'http://127.0.0.1:11434').trim().replace(/\/+$/, '');
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) cleanUrl = `http://${cleanUrl}`;
      cleanUrl = cleanUrl.replace(/\/api\/tags\/?$/i, '').replace(/\/api\/?$/i, '');
      const r = await fetch(`${cleanUrl}/api/tags`);
      if (!r.ok) throw new Error(`Ollama tags error: ${r.statusText}`);
      const data = await r.json();
      const models = (data.models || []).map(m => m.name);
      return res.json({ models });
    }

    if (provider === 'openai_compatible' || provider === 'openrouter') {
      const cleanBase = normalizeOpenAIBaseUrl(baseUrl);
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      const r = await fetch(`${cleanBase}/models`, { headers });
      if (!r.ok) throw new Error(`Failed to list models: ${r.statusText}`);
      const data = await r.json();
      const models = (data.data || []).map(m => m.id);
      return res.json({ models });
    }

    res.json({ models: [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


export function normalizeOpenAIBaseUrl(url) {
  if (!url || typeof url !== 'string') return 'https://api.openai.com/v1';
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `http://${cleaned}`;
  }
  // Strip trailing subpaths user might accidentally paste
  cleaned = cleaned.replace(/\/chat\/completions\/?$/i, '');
  cleaned = cleaned.replace(/\/models\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');

  // If user passed bare root host without /v1 (e.g. http://192.168.76.87:1234), append /v1 for standard openai endpoints
  if (!cleaned.endsWith('/v1') && !cleaned.includes('/v1/')) {
    cleaned = `${cleaned}/v1`;
  }
  return cleaned;
}

export async function callLLM(config, messages) {
  const { provider, baseUrl, apiKey, model, temperature } = config;

  if (provider === 'gemini') {
    let cleanUrl = (baseUrl || 'https://generativelanguage.googleapis.com').trim().replace(/\/+$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    const modelName = model || 'gemini-1.5-flash';
    const targetUrl = `${cleanUrl}/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.role === 'system' ? `[System Instructions: ${m.content}]` : m.content }]
    }));

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: temperature ?? 0.7,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) throw new Error('No candidate content returned from Gemini');
    return candidate;
  }

  if (provider === 'ollama') {
    let cleanUrl = (baseUrl || 'http://127.0.0.1:11434').trim().replace(/\/+$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `http://${cleanUrl}`;
    }
    cleanUrl = cleanUrl.replace(/\/api\/chat\/?$/i, '').replace(/\/api\/?$/i, '');
    const targetUrl = `${cleanUrl}/api/chat`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'llama3.2',
        messages,
        stream: false,
        options: { temperature: temperature ?? 0.7 }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.message?.content || '';
  }

  const cleanBase = normalizeOpenAIBaseUrl(baseUrl);
  const targetUrl = `${cleanBase}/chat/completions`;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://family-dashboard.local';
    headers['X-Title'] = 'Family Dashboard';
  }

  const payload = {
    model: model || 'gpt-4o-mini',
    messages,
    temperature: temperature ?? 0.7
  };

  // Only pass response_format: json_object for providers that explicitly support it or when requested
  if (provider === 'openrouter' || provider === 'chatgpt' || (model && (model.includes('gpt') || model.includes('deepseek')))) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No message content returned from LLM');
  return content;
}

// AI Generation Endpoint
router.post('/ai/generate-screen', requireAuth, async (req, res) => {
  try {
    const { prompt, orientation = 'landscape', targetMode = 'screen', currentBlocks = [], blockIndex = null } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const config = getStoredConfig();

    const systemPrompt = getThemedSystemPrompt(orientation);

    const userMessage = targetMode === 'block'
      ? `Generate a single styled block for this request: "${prompt}". Existing screen context has ${currentBlocks.length} blocks.`
      : `Create a complete themed screen for a ${orientation} display based on: "${prompt}".`;

    const rawResponse = await callLLM(config, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]);

    let parsed;
    try {
      const cleaned = rawResponse.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI JSON:', rawResponse);
      return res.status(502).json({ error: 'AI returned invalid JSON format', raw: rawResponse });
    }

    res.json({
      success: true,
      provider: config.provider,
      model: config.model,
      data: parsed
    });
  } catch (err) {
    console.error('AI Generation error:', err);
    res.status(500).json({ error: err.message || 'AI generation failed' });
  }
});

export default router;
