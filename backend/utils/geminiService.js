const { GoogleGenerativeAI } = require('@google/generative-ai');
const Job = require('../models/job.model');
const Application = require('../models/Application');
const {
  executeChatbotFunction,
  actionsForFunction,
} = require('../services/chatbotFunctions');
const { getContactTextForChatbot } = require('../controllers/contactPage.controller');

function resolveModel() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

function isNetworkError(err) {
  const msg = String(err?.message || err).toLowerCase();
  const code = err?.cause?.code;
  return (
    (err?.name === 'TypeError' && msg.includes('fetch')) ||
    ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'].includes(code)
  );
}

async function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: resolveModel() });
}

/**
 * Build a placement context string from a user object.
 */
function buildUserContext(user) {
  if (!user) return 'User is a guest (not logged in).';
  const profile = user.studentProfile || {};
  const name = profile.firstName || user.name || 'Student';
  const role = user.role || 'student';
  const skills = profile.skills?.join(', ') || 'N/A';
  const branch = profile.branch || 'N/A';
  return `User is logged in. Role: ${role}. Name: ${name}. Branch: ${branch}. Skills: ${skills}.`;
}

/**
 * Greeting handler
 */
function handleGreeting(user) {
  const name = user?.studentProfile?.firstName || user?.name || '';
  const greet = name ? `Hello, ${name}! 👋` : 'Hello! 👋';
  return {
    reply: `${greet} I'm your Smart Placement Assistant. Here's what I can help you with:\n\n• 🔍 **Find matching jobs** for your skills\n• 📋 **Check your application status**\n• 🎤 **Interview preparation** questions\n• 🧪 **Mock interview** practice\n• 📄 **Resume analysis** (upload PDF)\n\nWhat would you like to do?`,
    actions: [
      { label: '🔍 Find Jobs', type: 'message', target: 'show me job recommendations' },
      { label: '📋 My Applications', type: 'message', target: 'check my application status' },
      { label: '🎤 Interview Prep', type: 'message', target: 'help me prepare for interviews' },
    ],
  };
}

/**
 * Job recommendation handler — matches student skills with available jobs.
 */
async function handleGetJobs(user) {
  const jobs = await Job.find({}).populate('company').sort({ postedAt: -1 }).limit(10);
  if (!jobs.length) {
    return {
      reply: 'Currently, there are no open job positions. Please check back later!',
      actions: [{ label: 'Browse Jobs', type: 'navigate', target: '/student/jobs' }],
    };
  }

  const studentSkills = user?.studentProfile?.skills?.map(s => s.toLowerCase()) || [];

  // Score and sort jobs by skill match
  const scored = jobs.map(j => {
    const jobText = `${j.jobTitle} ${j.jobDescription || ''} ${j.eligibility || ''}`.toLowerCase();
    const matchCount = studentSkills.filter(sk => jobText.includes(sk)).length;
    return { job: j, matchCount };
  }).sort((a, b) => b.matchCount - a.matchCount).slice(0, 5);

  let reply = `**🔍 Top Job Recommendations${studentSkills.length ? ' Based on Your Skills' : ''}:**\n\n`;
  const actions = [];

  scored.forEach(({ job: j, matchCount }, i) => {
    const compName = j.company?.companyName || 'Unknown Company';
    const matchLabel = matchCount > 0 ? ` ✅ ${matchCount} skill match${matchCount > 1 ? 'es' : ''}` : '';
    reply += `**${i + 1}. ${j.jobTitle}** at ${compName}${matchLabel}\n`;
    if (j.salary) reply += `   💰 Salary: ₹${j.salary.toLocaleString()}\n`;
    if (j.applicationDeadline) reply += `   📅 Deadline: ${new Date(j.applicationDeadline).toLocaleDateString('en-IN')}\n`;
    reply += '\n';
  });

  actions.push({ label: '📋 View All Jobs', type: 'navigate', target: '/student/jobs' });
  return { reply, actions };
}

/**
 * Application status handler
 */
async function handleApplicationStatus(user) {
  if (!user || user.role === 'company') {
    return {
      reply: 'Please log in as a **student** to check your application status.',
      actions: [{ label: '🔐 Login', type: 'navigate', target: '/login' }],
    };
  }

  const apps = await Application.find({ studentId: user._id }).populate('jobId').sort({ updatedAt: -1 });
  if (!apps.length) {
    return {
      reply: "You haven't applied to any jobs yet. Browse available positions and apply now!",
      actions: [{ label: '🔍 Browse Jobs', type: 'navigate', target: '/student/jobs' }],
    };
  }

  const statusEmoji = {
    applied: '📤', under_review: '🔍', shortlisted: '⭐', interview: '📅', selected: '🎉', rejected: '❌'
  };

  let reply = `**📋 Your ${apps.length} Application${apps.length > 1 ? 's' : ''}:**\n\n`;
  apps.forEach((app, i) => {
    const jobTitle = app.jobId?.jobTitle || 'Unknown Job';
    const emoji = statusEmoji[app.status] || '📤';
    reply += `**${i + 1}. ${jobTitle}**\n   ${emoji} Status: **${app.status.replace(/_/g, ' ').toUpperCase()}**`;
    if (app.interviewDate) reply += `\n   📅 Interview: ${new Date(app.interviewDate).toLocaleString('en-IN')}`;
    if (app.interviewDetails?.meetingLink) reply += `\n   🔗 Meeting: ${app.interviewDetails.meetingLink}`;
    reply += '\n\n';
  });

  return {
    reply,
    actions: [{ label: '📋 View Applications', type: 'navigate', target: '/student/applications' }],
  };
}

/**
 * Interview help handler — uses Gemini to generate questions.
 */
async function handleInterviewHelp(message, user) {
  const model = await getGeminiModel();
  const branch = user?.studentProfile?.branch || '';
  const skills = user?.studentProfile?.skills?.join(', ') || '';

  // Extract role from message
  const roleMatch = message.match(/for\s+(?:a|an)?\s+([a-zA-Z\s]+?)(?:\s+interview|\s+role|\s+position|$)/i);
  const role = roleMatch ? roleMatch[1].trim() : (skills || branch || 'Software Developer');

  const prompt = `You are an expert placement coach. Generate 7 common interview questions for a "${role}" role with concise tips for each answer. Format as:\n**Q1: [Question]**\n💡 Tip: [Answer tip]\n\nKeep it practical and beginner-friendly.`;

  try {
    const response = await model.generateContent(prompt);
    return {
      reply: response.response.text(),
      actions: [
        { label: '🧪 Start Mock Interview', type: 'message', target: `start mock interview for ${role}` },
        { label: '📄 Analyze My Resume', type: 'message', target: 'analyze my resume' },
      ],
    };
  } catch (err) {
    if (isNetworkError(err)) throw err;
    return { reply: 'Unable to fetch interview questions right now. Please try again.', actions: [] };
  }
}

/**
 * Mock interview session handler.
 */
async function handleMockInterview(message, mockState) {
  const model = await getGeminiModel();

  // Start new mock interview
  if (!mockState || !mockState.active) {
    const roleMatch = message.match(/(?:for|about)\s+([a-zA-Z\s]+?)(?:\s+mock|\s+interview|$)/i);
    const role = roleMatch ? roleMatch[1].trim() : 'Software Developer';
    const prompt = `You are a technical interviewer. Ask the FIRST question of a mock interview for a ${role} position. Ask only ONE question, make it concise. Do NOT provide an answer or hints.`;
    const response = await model.generateContent(prompt);
    return {
      reply: `🧪 **Mock Interview Started!**\n\nRole: **${role}**\nAnswer each question and I'll evaluate your response.\n\n${response.response.text()}`,
      actions: [],
      mockState: { active: true, role, questionCount: 1 },
    };
  }

  // Evaluate answer and ask next question
  const { role, questionCount } = mockState;
  if (questionCount >= 5) {
    // End of mock interview
    const evalPrompt = `The mock interview for a ${role} role just ended after 5 questions. Give a short, encouraging completion message and 2-3 key improvements the candidate can make.`;
    const response = await model.generateContent(evalPrompt);
    return {
      reply: `✅ **Mock Interview Complete!**\n\n${response.response.text()}`,
      actions: [
        { label: '🔄 New Mock Interview', type: 'message', target: 'start mock interview' },
        { label: '📋 View Jobs', type: 'navigate', target: '/student/jobs' },
      ],
      mockState: null,
    };
  }

  const prompt = `You are a technical interviewer for a ${role} position. The candidate just answered.\nCandidate's answer: "${message}"\n\nBriefly evaluate their answer in 1-2 lines (strengths/weakness), then ask the NEXT interview question (question ${questionCount + 1} of 5). Keep it concise.`;
  const response = await model.generateContent(prompt);
  return {
    reply: response.response.text(),
    actions: [],
    mockState: { active: true, role, questionCount: questionCount + 1 },
  };
}

/**
 * Resume analysis trigger (file must be uploaded separately via /api/chatbot/resume)
 */
function handleResumeAnalysis() {
  return {
    reply: '📄 **Resume Analysis**\n\nClick the 📎 attachment icon in the chat to upload your resume (PDF). I\'ll analyze your skills, suggest improvements, and highlight missing keywords for tech roles.',
    actions: [],
  };
}

/**
 * Main function — getChatbotResponseWithContext
 * Dispatches by intent, falls back to Gemini with placement context.
 */
async function getChatbotResponseWithContext(message, intent, user, mockState = null) {
  const trimmed = typeof message === 'string' ? message.trim() : '';
  if (!trimmed) return { reply: 'Please send a non-empty message.', actions: [], mockState: null };

  try {
    // Handle intents
    if (intent === 'greeting') return { ...handleGreeting(user), mockState: null };
    if (intent === 'get_jobs') return { ...(await handleGetJobs(user)), mockState: null };
    if (intent === 'application_status') return { ...(await handleApplicationStatus(user)), mockState: null };
    if (intent === 'interview_help') return { ...(await handleInterviewHelp(trimmed, user)), mockState: null };
    if (intent === 'mock_interview' || (mockState && mockState.active)) {
      return await handleMockInterview(trimmed, mockState);
    }
    if (intent === 'resume_analysis') return { ...handleResumeAnalysis(), mockState: null };
    if (intent === 'get_contact_info') {
      const reply = await getContactTextForChatbot();
      return { reply, actions: [], mockState: null };
    }
    if (['register_user', 'login_user', 'get_connected_companies', 'get_job_openings', 'get_resume_upload_info'].includes(intent)) {
      return {
        reply: await executeChatbotFunction(intent),
        actions: actionsForFunction(intent),
        mockState: null,
      };
    }

    // Fallback — general Gemini with context
    const model = await getGeminiModel();
    const context = buildUserContext(user);
    const prompt = `You are a Smart Placement Assistant for a college placement management system. ${context}\n\nUser message: "${trimmed}"\n\nReply concisely and helpfully. If the question is about placements, jobs, interviews, or student career topics, answer directly. Otherwise, politely redirect to placement topics.`;

    let response;
    try {
      response = await model.generateContent(prompt);
    } catch (err) {
      if (isNetworkError(err)) {
        await new Promise(r => setTimeout(r, 500));
        response = await model.generateContent(prompt);
      } else {
        throw err;
      }
    }

    return { reply: response.response.text(), actions: [], mockState: null };

  } catch (err) {
    console.error('[geminiService] error:', err?.message || err);
    if (err?.message?.includes('GEMINI_API_KEY')) {
      return {
        reply: 'The AI assistant is not configured. Try keywords like: jobs, status, interview, register.',
        actions: [],
        mockState: null,
      };
    }
    if (isNetworkError(err)) {
      return {
        reply: 'Cannot reach the AI service right now. Check your connection and try again.',
        actions: [],
        mockState: null,
      };
    }
    return {
      reply: 'Sorry, something went wrong. Please try again shortly.',
      actions: [],
      mockState: null,
    };
  }
}

module.exports = { getChatbotResponseWithContext };
