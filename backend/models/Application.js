const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'],
      default: 'applied',
    },
    interviewDate: { type: Date },
    interviewLink: { type: String, trim: true },
    offerLetter: { type: String, trim: true },
    isAccepted: { type: Boolean, default: null },
    interviewDetails: {
      date: { type: Date },
      time: { type: String, trim: true },
      meetingLink: { type: String, trim: true },
    },
    resume: { type: String, trim: true },
  },
  { timestamps: true }
);

// Enforce one application per student per job.
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema, 'applications');
