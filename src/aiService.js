/**
 * src/aiService.js
 * 
 * Reusable frontend service module for calling the secure /api/ai-assistant endpoint.
 * Keeps all API logic, error formatting, and timeout management decoupled from UI components.
 */

const API_ENDPOINT = '/api/ai-assistant';

async function makeAiRequest(payload, timeoutMs = 45000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.error || `Server responded with status ${res.status}`;
      return {
        success: false,
        error: errorMsg,
        setupNeeded: Boolean(data?.setupNeeded),
        status: res.status,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out after waiting for NVIDIA NIM to respond. Please try again.',
        isTimeout: true,
      };
    }

    return {
      success: false,
      error: err.message || 'Network error connecting to the AI assistant endpoint.',
    };
  }
}

/**
 * Check if the server-side NVIDIA NIM API is configured
 */
export async function getAiAssistantStatus() {
  try {
    const res = await fetch(API_ENDPOINT, { method: 'GET' });
    if (!res.ok) return { configured: false };
    const data = await res.json();
    return {
      configured: Boolean(data.configured),
      model: data.model || 'nvidia/nemotron-3.5-lightning-30b-a3b',
      baseUrl: data.baseUrl,
    };
  } catch {
    return { configured: false, error: 'Could not reach server status endpoint.' };
  }
}

/**
 * Send a chat message in the Ambassador AI Chat
 */
export async function sendChatMessage({ messages = [], message = '', context = '' }) {
  const result = await makeAiRequest({
    action: 'chat',
    messages,
    message,
    context,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      setupNeeded: result.setupNeeded,
    };
  }

  return {
    success: true,
    reply: result.data.reply,
    model: result.data.model,
  };
}

/**
 * Generate targeted promotional social media content
 */
export async function generateSocialMediaContent({
  topic,
  platform = 'Instagram',
  tone = 'Engaging & Friendly',
  language = 'English',
  contentType = 'Full Post',
}) {
  const result = await makeAiRequest({
    action: 'social_content',
    topic,
    platform,
    tone,
    language,
    contentType,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      setupNeeded: result.setupNeeded,
    };
  }

  return {
    success: true,
    content: result.data.content,
  };
}

/**
 * Ask a question grounded in the approved Niyo Card & Program facts
 */
export async function askNiyoFaqAssistant({ question }) {
  const result = await makeAiRequest({
    action: 'faq',
    question,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      setupNeeded: result.setupNeeded,
    };
  }

  return {
    success: true,
    reply: result.data.reply,
  };
}

/**
 * Automatically categorize feedback without sending student personal data
 */
export async function categorizeFeedbackText({ feedbackText }) {
  // Only the feedback text itself is submitted. PII is excluded.
  const result = await makeAiRequest({
    action: 'feedback_categorization',
    feedbackText,
  });

  if (!result.success) {
    return {
      success: false,
      category: 'Uncategorized',
      reason: result.error || 'Categorization unavailable.',
      setupNeeded: result.setupNeeded,
    };
  }

  return {
    success: true,
    category: result.data.category || 'General Feedback',
    reason: result.data.reason || 'Categorized by NVIDIA NIM.',
  };
}
