/**
 * server/aiHandler.js
 * 
 * Secure Server-side API handler for NVIDIA NIM LLM integration in Niyo Campus.
 * 
 * SECURITY RULES ENFORCED:
 * 1. Server-side secrets (NVIDIA_API_KEY) are NEVER exposed to the frontend or browser.
 * 2. Never logs passwords, auth tokens, or personal identifiers.
 * 3. Does not send applicant PII (names, emails, phones) to the LLM during feedback categorization.
 * 4. Grounded in approved Niyo Campus & Niyo Global banking facts — never invents fake fees or perks.
 */

const APPROVED_NIYO_FACTS = `
[OFFICIAL NIYO PROGRAM & CARD KNOWLEDGE BASE]
1. Product: Niyo Global Card & Niyo Campus Student Ambassador Program.
2. Zero Forex Markup: Unlike traditional banks charging 3.5% - 5% + GST on foreign exchange, Niyo Global provides 0% forex markup on international spends in 150+ countries at live Visa exchange rates.
3. Account Charges: Zero annual maintenance charges (AMC) and zero account opening fee for students onboarded through Niyo Campus.
4. Currency Support: Spend in 150+ international currencies directly from an INR balance without prior currency loading or conversion hassles.
5. Airport Lounge Access: Complimentary domestic & international airport lounge passes at participating Indian international terminals for eligible student cardholders.
6. Card Controls & Security: Instant in-app card lock/unlock, toggle ATM / POS / International E-commerce channels, and 24/7 in-app emergency card freeze.
7. Support Channels: Official customer support email is support@goniyo.com, and 24/7 in-app live chat is available directly inside the Niyo mobile app.
8. Unverified Queries Policy: If an inquiry concerns specific banking policies, loan terms, credit limits, or fees not listed here, do NOT fabricate an answer. Direct the user to official Niyo Support (support@goniyo.com) or the in-app Help Center.
`;

/**
 * Execute raw request to NVIDIA NIM API
 */
async function callNvidiaNim({ messages, max_tokens = 1024, temperature = 0.5, top_p = 1 }) {
  const apiKey = process.env.NVIDIA_API_KEY?.trim();
  const model = process.env.NVIDIA_MODEL?.trim() || 'nvidia/nemotron-3.5-lightning-30b-a3b';
  const baseUrl = (process.env.NVIDIA_BASE_URL?.trim() || 'https://integrate.api.nvidia.com/v1').replace(/\/+$/, '');

  if (!apiKey || apiKey === 'your-nvidia-nim-api-key-here' || apiKey.includes('your_')) {
    return {
      status: 503,
      data: {
        error: 'NVIDIA NIM API key is not configured on the server. Please set NVIDIA_API_KEY in your .env file.',
        setupNeeded: true,
      },
    };
  }

  const endpoint = `${baseUrl}/chat/completions`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature,
        top_p,
        stream: false,
      }),
      signal: AbortSignal.timeout(45000), // 45-second timeout for server response
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = {};
      try {
        parsedErr = JSON.parse(errText);
      } catch {
        // ignore
      }

      console.error('[NVIDIA NIM API Error]', response.status, parsedErr?.message || parsedErr?.detail || errText.slice(0, 200));

      if (response.status === 401) {
        return {
          status: 401,
          data: {
            error: 'Authentication failed with NVIDIA NIM API. Please verify the NVIDIA_API_KEY in your .env file.',
            setupNeeded: true,
          },
        };
      }

      if (response.status === 429) {
        return {
          status: 429,
          data: {
            error: 'NVIDIA NIM API rate limit reached. Please wait a moment before trying again.',
          },
        };
      }

      return {
        status: response.status,
        data: {
          error: parsedErr?.message || parsedErr?.detail || 'Error communicating with NVIDIA NIM API provider.',
        },
      };
    }

    const json = await response.json();
    const choice = json.choices?.[0]?.message;
    const content = choice?.content?.trim() || choice?.reasoning_content?.trim() || '';

    return {
      status: 200,
      data: {
        reply: content,
        model: json.model || model,
        usage: json.usage || null,
      },
    };
  } catch (err) {
    if (err.name === 'TimeoutError' || err.message?.includes('timeout') || err.message?.includes('aborted')) {
      return {
        status: 504,
        data: {
          error: 'NVIDIA NIM request timed out. The model server might be busy. Please retry in a moment.',
        },
      };
    }

    console.error('[NVIDIA NIM Network Error]:', err.message);
    return {
      status: 500,
      data: {
        error: 'Network error connecting to NVIDIA NIM API. Please check your server internet connection.',
      },
    };
  }
}

/**
 * Main dispatcher for AI Assistant tasks
 */
export async function handleAiAssistantRequest(payload = {}) {
  const { action = 'chat' } = payload;

  // 1. Service Status Check
  if (action === 'status') {
    const hasKey = Boolean(process.env.NVIDIA_API_KEY?.trim() && !process.env.NVIDIA_API_KEY?.includes('your_'));
    return {
      status: 200,
      data: {
        configured: hasKey,
        model: process.env.NVIDIA_MODEL?.trim() || 'nvidia/nemotron-3.5-lightning-30b-a3b',
        baseUrl: process.env.NVIDIA_BASE_URL?.trim() || 'https://integrate.api.nvidia.com/v1',
      },
    };
  }

  // 2. Ambassador General AI Chat
  if (action === 'chat') {
    const rawMessages = Array.isArray(payload.messages) ? payload.messages : [];
    const userPrompt = payload.message?.trim();
    const context = payload.context || '';

    if (!userPrompt && rawMessages.length === 0) {
      return { status: 400, data: { error: 'Message content is required.' } };
    }

    // Limit context length to avoid token bloat
    const cleanContext = typeof context === 'string' ? context.slice(0, 300) : '';

    const systemPrompt = `You are the Niyo Campus AI Growth Assistant, an expert campus ambassador mentor for Niyo.
You empower student ambassadors with actionable campus outreach tactics, peer engagement ideas, orientation booth scripts, and event planning advice.
Tone: Energetic, practical, collegiate, encouraging, and highly professional.
Context: ${cleanContext ? cleanContext : 'Student Ambassador at a university campus.'}
Facts: Always stay factual about Niyo (0% forex markup, live Visa rates, zero annual charges, airport lounge access). Do not hallucinate fake perks or financial guarantees. Keep answers concise, actionable, and structured with bullet points.`;

    // Extract recent dialogue (up to last 6 messages)
    const formattedHistory = rawMessages.slice(-6).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 1000),
    }));

    if (userPrompt && (!formattedHistory.length || formattedHistory[formattedHistory.length - 1].content !== userPrompt)) {
      formattedHistory.push({ role: 'user', content: userPrompt.slice(0, 1500) });
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
    ];

    return await callNvidiaNim({ messages, max_tokens: 1024, temperature: 0.6 });
  }

  // 3. Social Media Content Assistant
  if (action === 'social_content') {
    const {
      topic = 'Zero Forex Benefits for Study Abroad',
      platform = 'Instagram',
      tone = 'Engaging & Friendly',
      language = 'English',
      contentType = 'Full Post',
    } = payload;

    const systemPrompt = `You are a high-performing social media copywriter for university student ambassadors promoting Niyo Campus.
Approved Product Guidelines:
- Zero forex markup on international card spends (150+ currencies at live Visa exchange rates).
- Zero annual maintenance charge (AMC) for students.
- Free airport lounge access at participating Indian international airports for qualifying trips.
- Safe app controls (instant lock/unlock, freeze).
CRITICAL RULES:
1. Do not invent non-existent cashback amounts, fake guarantees, or unauthorized brand partnerships.
2. Format specifically for the requested platform and content type.
3. Include clear Call-to-Action (CTA) directing peers to use the ambassador referral link.
4. Add 3-5 relevant, high-traffic hashtags.`;

    const userPrompt = `Create promotional content with the following specifications:
- Topic / Focus: ${String(topic).slice(0, 300)}
- Platform: ${platform}
- Content Type: ${contentType} (e.g. caption, full post, announcement, story script)
- Tone: ${tone}
- Language: ${language}

Generate ready-to-publish, high-converting copy now:`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const result = await callNvidiaNim({ messages, max_tokens: 1024, temperature: 0.7 });
    if (result.status === 200) {
      return { status: 200, data: { content: result.data.reply } };
    }
    return result;
  }

  // 4. Niyo Card & Program FAQ Assistant
  if (action === 'faq') {
    const question = payload.question?.trim();
    if (!question) {
      return { status: 400, data: { error: 'FAQ question is required.' } };
    }

    const systemPrompt = `You are the official Niyo Campus Program & Card FAQ Assistant.
Your sole job is to answer questions strictly using the verified information provided below:
${APPROVED_NIYO_FACTS}

STRICT COMPLIANCE RULES:
1. Only answer based on the knowledge base facts above.
2. If the user's question asks about something NOT in the facts above (such as credit loans, specific bank interest rates, fixed deposits, foreign tax laws, or third-party perks), you MUST respond with:
"I cannot confirm this specific detail from our approved Niyo Campus program guidelines. For accurate and official account terms, please reach out directly to official Niyo Support at support@goniyo.com or through the 24/7 in-app Help section in the Niyo App."
3. Do not speculate or make educated guesses on financial policies.
4. Keep answers brief, direct, and crystal clear.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question.slice(0, 1000) },
    ];

    return await callNvidiaNim({ messages, max_tokens: 512, temperature: 0.2 });
  }

  // 5. Feedback Categorization (Strictly NO Student PII sent)
  if (action === 'feedback_categorization') {
    const feedbackText = payload.feedbackText?.trim();
    if (!feedbackText) {
      return { status: 400, data: { error: 'Feedback text is required.' } };
    }

    const systemPrompt = `You are an automated feedback classification engine for the Niyo Campus Ambassador Portal.
Analyze the provided student ambassador feedback text and classify it into exactly ONE of the following 4 categories:
1. Bug Report (issues with app, broken links, technical glitches, portal errors)
2. Feature Suggestion (requests for new tools, marketing materials, app features, perks)
3. Campaign Feedback (comments on ambassador tasks, bounties, rewards, event drives)
4. General Feedback (overall impressions, praise, inquiries, or broad thoughts)

If the feedback text is ambiguous, gibberish, or does not clearly fit any of the above, classify it as "Uncategorized".

OUTPUT FORMAT:
Respond with STRICT VALID JSON only. Do not add markdown backticks. Example:
{"category": "Feature Suggestion", "reason": "Ambassador requested customizable flyer templates for student clubs."}`;

    // Notice: only the feedback text itself is sent. No student names, emails, or phone numbers.
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Feedback text: "${feedbackText.slice(0, 1500)}"` },
    ];

    const result = await callNvidiaNim({ messages, max_tokens: 256, temperature: 0.1 });
    if (result.status === 200) {
      let parsed = { category: 'General Feedback', reason: 'Categorized from ambassador comments.' };
      try {
        const raw = result.data.reply.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(raw);
      } catch {
        // Fallback parsing if JSON wasn't returned cleanly
        const lower = result.data.reply.toLowerCase();
        if (lower.includes('bug')) parsed = { category: 'Bug Report', reason: 'Technical issue mentioned.' };
        else if (lower.includes('feature')) parsed = { category: 'Feature Suggestion', reason: 'Feature or asset requested.' };
        else if (lower.includes('campaign')) parsed = { category: 'Campaign Feedback', reason: 'Campaign or task feedback.' };
        else parsed = { category: 'Uncategorized', reason: 'Could not clearly classify with confidence.' };
      }

      return {
        status: 200,
        data: {
          category: parsed.category || 'General Feedback',
          reason: parsed.reason || 'Categorized by NVIDIA NIM.',
        },
      };
    }
    return result;
  }

  return { status: 400, data: { error: `Unsupported action: '${action}'` } };
}
