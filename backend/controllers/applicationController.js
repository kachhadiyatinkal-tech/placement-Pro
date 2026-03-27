const mongoose = require('mongoose');
const Application = require('../models/Application');
const User = require('../models/user.model');
const Job = require('../models/job.model');

const MANAGER_ROLES = ['tpo', 'company'];
const UPDATABLE_STATUSES = ['shortlisted', 'interview', 'selected', 'rejected'];

const allowedTransitions = {
  applied: ['shortlisted', 'interview', 'selected', 'rejected'],
  shortlisted: ['interview', 'selected', 'rejected'],
  interview: ['selected', 'rejected'],
  selected: [],
  rejected: [],
};

function canManageApplications(role) {
  return MANAGER_ROLES.includes(String(role || '').toLowerCase());
}

function canApply(role) {
  return String(role || '').toLowerCase() === 'student';
}

function resumePathFromUser(userDoc) {
  return userDoc?.studentProfile?.resume?.filepath || '';
}

async function syncLegacyStatus({ studentId, jobId, status }) {
  await Promise.all([
    Job.updateOne(
      { _id: jobId, 'applicants.studentId': studentId },
      { $set: { 'applicants.$.status': status } }
    ),
    User.updateOne(
      { _id: studentId, 'studentProfile.appliedJobs.jobId': jobId },
      { $set: { 'studentProfile.appliedJobs.$.status': status } }
    ),
  ]);
}

const applyToJob = async (req, res) => {
  try {
    if (!canApply(req?.user?.role)) {
      return res.status(403).json({ msg: 'Only students can apply for jobs.' });
    }

    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: 'Invalid job id.' });
    }

    const studentId = req.user._id;
    const [student, job] = await Promise.all([
      User.findById(studentId),
      Job.findById(jobId),
    ]);

    if (!student || String(student.role).toLowerCase() !== 'student') {
      return res.status(404).json({ msg: 'Student not found.' });
    }
    if (!job) {
      return res.status(404).json({ msg: 'Job not found.' });
    }

    const existing = await Application.findOne({ studentId, jobId });
    if (existing) {
      return res.status(409).json({ msg: 'You have already applied for this job.' });
    }

    const resume = resumePathFromUser(student);
    const application = await Application.create({
      studentId,
      jobId,
      status: 'applied',
      resume: resume || undefined,
    });

    // Keep legacy arrays in sync so existing dashboards continue to work.
    await Promise.all([
      User.updateOne(
        { _id: studentId },
        {
          $addToSet: {
            'studentProfile.appliedJobs': {
              jobId,
              status: 'applied',
              appliedAt: new Date(),
            },
          },
        }
      ),
      Job.updateOne(
        { _id: jobId },
        {
          $addToSet: {
            applicants: {
              studentId,
              status: 'applied',
              appliedAt: new Date(),
            },
          },
        }
      ),
    ]);

    return res.status(201).json({ msg: 'Application submitted successfully.', application });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ msg: 'You have already applied for this job.' });
    }
    console.log('applicationController.applyToJob => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

const getStudentApplications = async (req, res) => {
  try {
    if (!canApply(req?.user?.role)) {
      return res.status(403).json({ msg: 'Only students can access this resource.' });
    }

    const applications = await Application.find({ studentId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'jobTitle salary company applicationDeadline',
        populate: { path: 'company', select: 'companyName companyLocation' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: applications });
  } catch (error) {
    console.log('applicationController.getStudentApplications => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

const getJobApplicants = async (req, res) => {
  try {
    if (!canManageApplications(req?.user?.role)) {
      return res.status(403).json({ msg: 'Only TPO or company can access this resource.' });
    }

    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: 'Invalid job id.' });
    }

    const applicants = await Application.find({ jobId })
      .populate({
        path: 'studentId',
        select: 'first_name last_name email profile studentProfile.resume',
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: applicants });
  } catch (error) {
    console.log('applicationController.getJobApplicants => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    if (!canManageApplications(req?.user?.role)) {
      return res.status(403).json({ msg: 'Only TPO or company can update application status.' });
    }

    const { applicationId } = req.params;
    const { status, interviewDetails } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ msg: 'Invalid application id.' });
    }

    if (!UPDATABLE_STATUSES.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value.' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ msg: 'Application not found.' });
    }

    const current = application.status;
    const allowed = allowedTransitions[current] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        msg: `Invalid status transition from "${current}" to "${status}".`,
      });
    }

    application.status = status;
    if (status === 'interview') {
      application.interviewDetails = {
        date: interviewDetails?.date || application?.interviewDetails?.date,
        time: interviewDetails?.time || application?.interviewDetails?.time,
        meetingLink: interviewDetails?.meetingLink || application?.interviewDetails?.meetingLink,
      };
    }

    await application.save();
    await syncLegacyStatus({
      studentId: application.studentId,
      jobId: application.jobId,
      status: application.status,
    });

    return res.status(200).json({ msg: 'Application status updated.', data: application });
  } catch (error) {
    console.log('applicationController.updateApplicationStatus => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

module.exports = {
  applyToJob,
  getStudentApplications,
  getJobApplicants,
  updateApplicationStatus,
};
