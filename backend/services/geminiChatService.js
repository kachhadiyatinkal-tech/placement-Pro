const { GoogleGenerativeAI, FunctionCallingMode } = require('@google/generative-ai');
const {
  NAMES,
  executeChatbotFunction,
  actionsForFunction,
} = require('./chatbotFunctions');
const { detectRuleBasedIntent } = require('./chatIntentRouter');
const { getContactTextForChatbot } = require('../controllers/contactPage.controller');

const KNOWN_FUNCTIONS = new Set(Object.values(NAMES));

/** Google retires unversioned ids; map old env values so requests don't 404. */
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const LEGACY_MODEL_ALIASES = {
  'gemini-1.5-flash': DEFAULT_GEMINI_MODEL,
  'gemini-1.5-flash-latest': DEFAULT_GEMINI_MODEL,
  'gemini-1.5-pro': DEFAULT_GEMINI_MODEL,
  'gemini-1.5-flash-8b': DEFAULT_GEMINI_MODEL,
};

function resolveGeminiModelName() {
  const raw = (process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
  return LEGACY_MODEL_ALIASES[raw] || raw;
}

function isLikelyNetworkError(err) {
  if (!err) return false;
  const msg = String(err.message || err).toLowerCase();
  if (err.name === 'TypeError' && (msg.includes('fetch failed') || msg.includes('fetch'))) return true;
  const code = err.cause && err.cause.code;
  if (code && ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN'].includes(code)) return true;
  return false;
}

function buildFunctionDeclarations() {
  return [
    {
      name: NAMES.REGISTER_USER,
      description: 'Returns the registration URL for new students/users.',
    },
    {
      name: NAMES.LOGIN_USER,
      description: 'Returns the login URL for existing students/users.',
    },
    {
      name: NAMES.GET_JOB_OPENINGS,
      description: 'Fetches current job openings and vacancies from the platform.',
    },
    {
      name: NAMES.GET_CONNECTED_COMPANIES,
      description: 'Returns a list of companies connected with the placement platform.',
    },
    {
      name: NAMES.GET_RESUME_UPLOAD_INFO,
      description: 'Provides instructions and links for students to upload their resumes.',
    },
    {
      name: NAMES.GET_CONTACT_INFO,
      description: 'Returns contact details (email, phone) for support.',
    },
  ];
}

/**
 * Fallback path: Gemini decides whether to reply in natural language or call a tool.
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
async function runGeminiWithTools(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const modelName = resolveGeminiModelName();
  const genAI = new GoogleGenerativeAI(apiKey);
  const functionDeclarations = buildFunctionDeclarations();

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: {
      parts: [
        {
          text:
            'You are a helpful assistant for a college placement management platform. ' +
            'Use the provided tools to answer questions about jobs, companies, registration, login, and resume uploads. ' +
            'For general questions, answer briefly and politely.',
        },
      ],
    },
    tools: [{ functionDeclarations }],
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingMode.AUTO,
      },
    },
  });

  let first;
  try {
    first = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    });
  } catch (e) {
    if (isLikelyNetworkError(e)) {
      await new Promise((r) => setTimeout(r, 400));
      first = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      });
    } else {
      throw e;
    }
  }

  const res1 = first.response;
  const calls = res1.functionCalls && res1.functionCalls();

  if (!calls || calls.length === 0) {
    const text = res1.text && res1.text();
    if (text && text.trim()) return text.trim();
    return 'Sorry, I could not generate a reply. Please try again.';
  }

  const fc = calls[0];
  if (!fc || !KNOWN_FUNCTIONS.has(fc.name)) {
    const text = res1.text && res1.text();
    if (text && text.trim()) return text.trim();
    return 'Sorry, I could not complete that action.';
  }

  // Handle get_contact_info specially if it points to contact controller
  const toolOutput =
    fc.name === NAMES.GET_CONTACT_INFO
      ? await getContactTextForChatbot()
      : await executeChatbotFunction(fc.name);

  const second = await model.generateContent({
    contents: [
      { role: 'user', parts: [{ text: userMessage }] },
      {
        role: 'model',
        parts: [{ functionCall: { name: fc.name, args: fc.args || {} } }],
      },
      {
        role: 'function',
        parts: [
          {
            functionResponse: {
              name: fc.name,
              response: { result: toolOutput },
            },
          },
        ],
      },
    ],
  });

  const text2 = second.response.text();
  if (text2 && text2.trim()) return text2.trim();
  return toolOutput;
}

/**
 * @param {string} userMessage
 * @returns {Promise<{ reply: string, actions: Array, source: string }>}
 */
async function getChatbotResponse(userMessage) {
  const raw = typeof userMessage === 'string' ? userMessage : '';
  const trimmed = raw.trim();

  if (!trimmed) {
    return { reply: 'Please send a non-empty message.', actions: [], source: 'validation' };
  }

  const intent = detectRuleBasedIntent(trimmed);
  if (intent) {
    if (intent === NAMES.GET_CONTACT_INFO) {
      const reply = await getContactTextForChatbot();
      return { reply, actions: [], source: 'rule' };
    }
    return {
      reply: await executeChatbotFunction(intent),
      actions: actionsForFunction(intent),
      source: 'rule',
    };
  }

  try {
    const reply = await runGeminiWithTools(trimmed);
    return { reply, actions: [], source: 'gemini' };
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    if (msg.includes('GEMINI_API_KEY')) {
      return {
        reply:
          'The AI assistant is not configured (missing GEMINI_API_KEY). ' +
          'You can still use keywords like register, login, company, or contact for quick answers.',
        actions: [],
        source: 'error',
      };
    }
    const notFound =
      err && (err.status === 404 || /is not found|not supported for generateContent/i.test(msg));
    if (notFound) {
      console.warn(
        '[chatbot] Gemini model missing or invalid. Using resolveGeminiModelName(); set GEMINI_MODEL (e.g. gemini-2.5-flash).',
      );
      return {
        reply:
          'The AI model name is invalid or no longer available. Set GEMINI_MODEL in the server environment ' +
          '(for example gemini-2.5-flash) and restart. Keyword shortcuts still work.',
        actions: [],
        source: 'error',
      };
    }
    if (isLikelyNetworkError(err)) {
      console.warn(
        '[chatbot] Could not reach Gemini API (network). Check internet, firewall, or VPN; keyword shortcuts still work.',
      );
      return {
        reply:
          'The assistant could not reach the AI service (network error). Check your connection or firewall, then try again. ' +
          'You can still use keywords like register, login, company, or contact.',
        actions: [],
        source: 'error',
      };
    }
    console.error('geminiChatService error:', err.message || err);
    return {
      reply: 'Sorry, something went wrong while contacting the AI. Please try again shortly.',
      actions: [],
      source: 'error',
    };
  }
}

module.exports = {
  getChatbotResponse,
  runGeminiWithTools,
};
