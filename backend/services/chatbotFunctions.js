const Job = require('../models/job.model');
const Company = require('../models/company.model');
const { contact } = require('../data/mockChatbotData');

const NAMES = {
  REGISTER_USER: 'register_user',
  LOGIN_USER: 'login_user',
  GET_COMPANY_INFO: 'get_company_info',
  GET_CONTACT_INFO: 'get_contact_info',
  GET_JOB_OPENINGS: 'get_job_openings',
  GET_CONNECTED_COMPANIES: 'get_connected_companies',
  GET_RESUME_UPLOAD_INFO: 'get_resume_upload_info',
};

function registerUrl() {
  return process.env.CHATBOT_REGISTER_URL || '/register';
}

function loginUrl() {
  return process.env.CHATBOT_LOGIN_URL || '/login';
}

async function formatJobsText() {
  try {
    const jobs = await Job.find({}).populate('company').sort({ postedAt: -1 }).limit(5);
    if (!jobs || jobs.length === 0) return "Currently, there are no open job positions. Please check back later!";

    let text = "Here are some of the latest job openings:\n\n";
    jobs.forEach((j, i) => {
      const compName = j.company?.companyName || 'Unknown Company';
      text += `${i + 1}. ${j.jobTitle} at ${compName}\n`;
      if (j.salary) text += `   Salary: ₹${j.salary.toLocaleString()}\n`;
      if (j.applicationDeadline) text += `   Deadline: ${new Date(j.applicationDeadline).toLocaleDateString()}\n`;
      text += "\n";
    });
    text += "You can view all jobs and apply in the 'Jobs' section after logging in.";
    return text;
  } catch (err) {
    console.error('formatJobsText error:', err);
    return "I'm having trouble fetching job openings right now. Please try again later.";
  }
}

async function formatCompaniesText() {
  try {
    const companies = await Company.find({ isActive: true }).select('companyName companyLocation').limit(10);
    if (!companies || companies.length === 0) return "We are currently building our network of companies. Check back soon!";

    let text = "Here are some of the companies connected with us:\n\n";
    companies.forEach((c, i) => {
      text += `${i + 1}. ${c.companyName}${c.companyLocation ? ` (${c.companyLocation})` : ''}\n`;
    });
    if (companies.length >= 10) text += "\n...and many more!";
    return text;
  } catch (err) {
    console.error('formatCompaniesText error:', err);
    return "I'm having trouble fetching company details right now.";
  }
}

function formatResumeUploadText() {
  return "To upload your resume:\n1. Log in to your student account.\n2. Go to your 'Profile' section.\n3. Look for the 'Resume' or 'Documents' upload field.\n4. Upload your PDF or Word file and click save.";
}

async function executeChatbotFunction(name) {
  switch (name) {
    case NAMES.REGISTER_USER:
      return `Register here: ${registerUrl()}`;
    case NAMES.LOGIN_USER:
      return `Login here: ${loginUrl()}`;
    case NAMES.GET_COMPANY_INFO:
    case NAMES.GET_CONNECTED_COMPANIES:
      return await formatCompaniesText();
    case NAMES.GET_CONTACT_INFO:
      return `Email: ${contact.email}\nPhone: ${contact.phone}`;
    case NAMES.GET_JOB_OPENINGS:
      return await formatJobsText();
    case NAMES.GET_RESUME_UPLOAD_INFO:
      return formatResumeUploadText();
    default:
      throw new Error(`Unknown function: ${name}`);
  }
}

function actionsForFunction(name) {
  switch (name) {
    case NAMES.REGISTER_USER:
      return [{ label: 'Open registration', type: 'navigate', target: registerUrl() }];
    case NAMES.LOGIN_USER:
      return [{ label: 'Open login', type: 'navigate', target: loginUrl() }];
    case NAMES.GET_JOB_OPENINGS:
      return [{ label: 'View All Jobs', type: 'navigate', target: '/student/jobs' }];
    case NAMES.GET_RESUME_UPLOAD_INFO:
      return [{ label: 'Go to Profile', type: 'navigate', target: '/student/profile' }];
    case NAMES.GET_CONNECTED_COMPANIES:
      return [{ label: 'Browse Jobs', type: 'navigate', target: '/jobs' }];
    default:
      return [];
  }
}

module.exports = {
  NAMES,
  registerUrl,
  loginUrl,
  executeChatbotFunction,
  actionsForFunction,
};
