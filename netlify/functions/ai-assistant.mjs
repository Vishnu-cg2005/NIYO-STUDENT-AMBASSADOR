import { handleAiAssistantRequest } from '../../server/aiHandler.js';

export async function handler(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    const result = await handleAiAssistantRequest({ action: 'status' });
    return {
      statusCode: result.status,
      headers,
      body: JSON.stringify(result.data),
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const payload = JSON.parse(event.body || '{}');
      const result = await handleAiAssistantRequest(payload);
      return {
        statusCode: result.status,
        headers,
        body: JSON.stringify(result.data),
      };
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON payload' }),
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
}
