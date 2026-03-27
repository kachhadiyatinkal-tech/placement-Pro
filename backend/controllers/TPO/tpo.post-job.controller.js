const JobSchema = require("../../models/job.model");
const { sendError, sendSuccess } = require("../../utils/apiResponse");

const PostJob = async (req, res) => {
  try {
    const company = req.body.company;
    const jobTitle = req.body.jobTitle;
    const jobDescription = req.body.jobDescription;
    const eligibility = req.body.eligibility;
    const salary = req.body.salary;
    const howToApply = req.body.howToApply;
    const applicationDeadline = req.body.applicationDeadline;


    // console.log(newJob);

    if (!jobTitle || !jobDescription || !eligibility || !company) {
      return sendError(res, 400, 'Validation failed', {
        jobTitle: !jobTitle ? 'Job title is required.' : undefined,
        jobDescription: !jobDescription ? 'Job description is required.' : undefined,
        eligibility: !eligibility ? 'Eligibility is required.' : undefined,
        company: !company ? 'Company is required.' : undefined,
      });
    }

    const job = await JobSchema.findById(req.body._id);

    if (job) {
      await job.updateOne({
        company,
        jobTitle,
        jobDescription,
        eligibility,
        salary,
        howToApply,
        applicationDeadline
      });
      return sendSuccess(res, 201, { message: 'Updated successfully' });
    } else {
      // Create a new job object
      const newJob = new JobSchema({
        jobTitle,
        jobDescription,
        eligibility,
        salary,
        howToApply,
        postedAt: new Date(),
        applicationDeadline,
        company
      });
      await newJob.save();
      return sendSuccess(res, 201, { message: 'Created successfully' });
    }

  } catch (error) {
    console.log("tpo.post-job.controller.js => ", error);
    return sendError(res, 500, 'Internal server error');
  }
}

module.exports = PostJob;