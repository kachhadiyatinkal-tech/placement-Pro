const mongoose = require('mongoose');
const Application = require('../models/Application');
const User = require('../models/user.model');
const Job = require('../models/job.model');

const MANAGER_ROLES = ['tpo', 'company', 'admin', 'management', 'superuser'];
const UPDATABLE_STATUSES = ['under_review', 'shortlisted', 'interview', 'selected', 'rejected'];

const allowedTransitions = {
  pending: ['under_review', 'shortlisted', 'interview', 'selected', 'rejected'],
  applied: ['under_review', 'shortlisted', 'interview', 'selected', 'rejected'],
  under_review: ['shortlisted', 'interview', 'selected', 'rejected'],
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
    const { coverLetter, phone, expectedGraduationYear } = req.body || {};

    const [student, job] = await Promise.all([
      User.findById(studentId),
      Job.findById(jobId).populate('company'),
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
      companyId: job.company,
      status: 'pending',
      resume: resume || undefined,
    });

    // Keep legacy arrays in sync so existing dashboards continue to work.
    // Also persist the application-specific form fields (cover letter, phone, grad year).
    await Promise.all([
      User.updateOne(
        { _id: studentId },
        {
          $addToSet: {
            'studentProfile.appliedJobs': {
              jobId,
              status: 'pending',
              appliedAt: new Date(),
              ...(coverLetter && { coverLetter }),
              ...(phone && { phone }),
              ...(expectedGraduationYear && { expectedGraduationYear }),
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
              status: 'pending',
              appliedAt: new Date(),
            },
          },
        }
      ),
    ]);

    const { enqueueEmail } = require('../services/email.queue');

    // Send confirmation email to student (Fire and forget)
    enqueueEmail({
      email: student.email,
      subject: `Application Received: ${job.jobTitle}`,
      template: 'jobApplication',
      templateData: {
        studentName: `${student.first_name} ${student.last_name}`,
        jobTitle: job.jobTitle,
        companyName: job.company?.companyName || 'the company'
      },
      message: `You have successfully applied for this job: ${job.jobTitle}`
    }).catch(err => console.log('Failed to queue application email:', err));

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

    const query = { jobId };
    if (req.user.role === 'company') {
      query.companyId = req.user._id;
    }

    const applicants = await Application.find(query)
      .populate({
        path: 'studentId',
        select:
          'first_name last_name email number profile gender dateOfBirth fullAddress ' +
          'studentProfile',
      })
      .populate({
        path: 'jobId',
        select: 'jobTitle company',
        populate: { path: 'company', select: 'companyName companyLocation' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: applicants });
  } catch (error) {
    console.log('applicationController.getJobApplicants => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

const getAllApplications = async (req, res) => {
  try {
    if (!canManageApplications(req?.user?.role)) {
      return res.status(403).json({ msg: 'Access denied.' });
    }

    const applicants = await Application.find()
      .populate({
        path: 'studentId',
        select: 'first_name last_name email profile studentProfile.resume',
      })
      .populate({
        path: 'jobId',
        select: 'jobTitle company',
        populate: { path: 'company', select: 'companyName' }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: applicants });
  } catch (error) {
    console.log('applicationController.getAllApplications => ', error);
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

    if (req.user.role === 'company' && String(application.companyId) !== String(req.user._id)) {
      return res.status(403).json({ msg: 'You can only update your own applications.' });
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

    // Fetch details for email notification (student email, job title, company name)
    const updatedApp = await Application.findById(applicationId)
      .populate({
        path: 'studentId',
        select: 'first_name last_name email number profile gender dateOfBirth fullAddress studentProfile',
      })
      .populate({
        path: 'jobId',
        select: 'jobTitle company',
        populate: { path: 'company', select: 'companyName' }
      });

    if (updatedApp && updatedApp.studentId && updatedApp.studentId.email) {
      const { enqueueEmail } = require('../services/email.queue');
      
      const studentName = `${updatedApp.studentId.first_name} ${updatedApp.studentId.last_name}`;
      const jobTitle = updatedApp.jobId?.jobTitle || 'Unknown Position';
      const companyName = updatedApp.jobId?.company?.companyName || 'the company';
      const formattedStatus = status.replace('_', ' ').toUpperCase();

      enqueueEmail({
        email: updatedApp.studentId.email,
        subject: `Status Updated: ${jobTitle}`,
        template: 'statusUpdate',
        templateData: {
          studentName,
          jobTitle,
          companyName,
          newStatus: formattedStatus,
          isInterview: status === 'interview',
          interviewDate: interviewDetails?.date,
          interviewTime: interviewDetails?.time,
          meetingLink: interviewDetails?.meetingLink
        },
        message: `Your application status for ${jobTitle} at ${companyName} has been updated to ${formattedStatus}.`
      }).catch(err => console.log('Failed to queue status update email:', err));
    }

    await syncLegacyStatus({
      studentId: application.studentId,
      jobId: application.jobId,
      status: application.status,
    });

    return res.status(200).json({ msg: 'Application status updated.', data: updatedApp });
  } catch (error) {
    console.log('applicationController.updateApplicationStatus => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

const scheduleInterview = async (req, res) => {
  try {
    if (!canManageApplications(req?.user?.role)) {
      return res.status(403).json({ msg: 'Only TPO or company can schedule interviews.' });
    }

    const { id } = req.params;
    const { interviewDate, interviewLink } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid application id.' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ msg: 'Application not found.' });
    }

    application.status = 'interview';
    application.interviewDate = interviewDate;
    application.interviewLink = interviewLink;

    await application.save();

    // Fetch details for email notification
    const updatedApp = await Application.findById(id)
      .populate({
        path: 'studentId',
        select: 'first_name last_name email number profile gender dateOfBirth fullAddress studentProfile',
      })
      .populate({
        path: 'jobId',
        select: 'jobTitle company',
        populate: { path: 'company', select: 'companyName' }
      });

    if (updatedApp && updatedApp.studentId && updatedApp.studentId.email) {
      const { enqueueEmail } = require('../services/email.queue');
      
      const studentName = `${updatedApp.studentId.first_name} ${updatedApp.studentId.last_name}`;
      const jobTitleString = updatedApp.jobId?.jobTitle || 'Unknown Position';
      const companyNameString = updatedApp.jobId?.company?.companyName || 'the company';

      enqueueEmail({
        email: updatedApp.studentId.email,
        subject: `Interview Scheduled: ${jobTitleString}`,
        template: 'statusUpdate',
        templateData: {
          studentName,
          jobTitle: jobTitleString,
          companyName: companyNameString,
          newStatus: 'INTERVIEW',
          isInterview: true,
          interviewDate: interviewDate,
          meetingLink: interviewLink
        },
        message: `An interview has been scheduled for ${jobTitleString} at ${companyNameString}.`
      }).catch(err => console.log('Failed to queue interview email:', err));
    }

    // Sync legacy array status
    await syncLegacyStatus({
      studentId: application.studentId,
      jobId: application.jobId,
      status: application.status,
    });

    return res.status(200).json({ msg: 'Interview scheduled successfully.', data: updatedApp });
  } catch (error) {
    console.log('applicationController.scheduleInterview => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

const uploadOfferLetterEndpoint = async (req, res) => {
  try {
    if (!canManageApplications(req?.user?.role)) {
      return res.status(403).json({ msg: 'Only TPO or company can upload offer letters.' });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid application id.' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ msg: 'Application not found.' });
    }

    // Set offer letter URL
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:' + process.env.PORT}/offerLetter/${req.file.filename}`;
    application.offerLetter = fileUrl;

    await application.save();

    return res.status(200).json({ msg: 'Offer letter uploaded successfully.', data: application });
  } catch (error) {
    console.log('applicationController.uploadOfferLetterEndpoint => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

const respondToOffer = async (req, res) => {
  try {
    if (!canApply(req?.user?.role)) {
      return res.status(403).json({ msg: 'Only students can respond to offers.' });
    }

    const { id } = req.params;
    const { isAccepted } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid application id.' });
    }

    const application = await Application.findOne({ _id: id, studentId: req.user._id });
    if (!application) {
      return res.status(404).json({ msg: 'Application not found.' });
    }

    application.isAccepted = isAccepted;

    await application.save();

    return res.status(200).json({ msg: 'Offer response recorded successfully.', data: application });
  } catch (error) {
    console.log('applicationController.respondToOffer => ', error);
    return res.status(500).json({ msg: 'Internal Server Error!' });
  }
};

module.exports = {
  applyToJob,
  getStudentApplications,
  getJobApplicants,
  getAllApplications,
  updateApplicationStatus,
  scheduleInterview,
  uploadOfferLetterEndpoint,
  respondToOffer,
};

