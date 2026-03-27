const User = require("../../models/user.model");
const jobSchema = require("../../models/job.model");
const { isApplicationDeadlinePassed } = require("../../utils/jobDeadline");
const { sendError, sendSuccess } = require("../../utils/apiResponse");

function validateApplicationBody(body) {
  const coverLetter = typeof body?.coverLetter === "string" ? body.coverLetter.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.replace(/\s/g, "") : "";
  const yearRaw = body?.expectedGraduationYear;
  const year =
    yearRaw === "" || yearRaw == null
      ? NaN
      : typeof yearRaw === "number"
        ? yearRaw
        : parseInt(String(yearRaw), 10);

  const errors = {};
  if (coverLetter.length < 40) {
    errors.coverLetter = "Cover letter must be at least 40 characters.";
  }
  if (coverLetter.length > 5000) {
    errors.coverLetter = "Cover letter must be at most 5000 characters.";
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }
  if (!Number.isFinite(year) || year < 2024 || year > 2035) {
    errors.expectedGraduationYear = "Expected graduation year must be between 2024 and 2035.";
  }

  if (Object.keys(errors).length) return { errors };
  return { coverLetter, phone, expectedGraduationYear: year };
}

const AppliedToJob = async (req, res) => {
  try {
    if (req.params.studentId === "undefined" || !req.params.studentId) {
      return sendError(res, 400, "Validation failed", { studentId: "Invalid student." });
    }
    if (req.params.jobId === "undefined" || !req.params.jobId) {
      return sendError(res, 400, "Validation failed", { jobId: "Invalid job." });
    }

    const parsed = validateApplicationBody(req.body || {});
    if (parsed.errors) {
      return sendError(res, 400, "Validation failed", parsed.errors);
    }
    const { coverLetter, phone, expectedGraduationYear } = parsed;

    const user = await User.findById(req.params.studentId);
    const job = await jobSchema.findById(req.params.jobId);

    if (!user) return sendError(res, 404, "Validation failed", { studentId: "Student not found." });
    if (!job) return sendError(res, 404, "Validation failed", { jobId: "Job not found." });

    if (isApplicationDeadlinePassed(job.applicationDeadline)) {
      return sendError(res, 400, "Validation failed", {
        applicationDeadline: "The application deadline for this role has passed. New applications are no longer accepted.",
      });
    }

    if (user?.studentProfile?.appliedJobs?.some((j) => String(j.jobId) === String(req.params.jobId))) {
      return sendError(res, 400, "Validation failed", { application: "Already applied to this job." });
    }

    if (!user?.studentProfile?.resume?.filename) {
      return sendError(res, 400, "Validation failed", {
        resume: 'Please upload your resume first under Profile / Placements before applying.',
      });
    }

    if (!user.studentProfile) user.studentProfile = {};
    if (!user.studentProfile.appliedJobs) user.studentProfile.appliedJobs = [];

    user.studentProfile.appliedJobs.push({
      jobId: req.params.jobId,
      status: "applied",
      appliedAt: new Date(),
      coverLetter,
      phone,
      expectedGraduationYear,
    });

    job.applicants.push({
      studentId: user._id,
      status: "applied",
      appliedAt: new Date(),
      coverLetter,
      contactPhone: phone,
      expectedGraduationYear,
    });

    await user.save();
    await job.save();
    return sendSuccess(res, 201, { message: "Applied successfully" });
  } catch (error) {
    console.log("apply-job.controller.js => ", error);
    return sendError(res, 500, "Internal server error");
  }
};

const CheckAlreadyApplied = async (req, res) => {
  try {
    if (req.params.studentId === "undefined") return;
    if (req.params.jobId === "undefined") return;

    const user = await User.findById(req.params.studentId);

    if (user?.studentProfile?.appliedJobs?.some((job) => job.jobId == req.params.jobId))
      return res.json({ applied: true });
    else return res.json({ applied: false });
  } catch (error) {
    console.log("apply-job.controller.js => ", error);
    return sendError(res, 500, "Internal server error");
  }
};

module.exports = {
  AppliedToJob,
  CheckAlreadyApplied,
};
